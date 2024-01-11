from flask import Flask, request, jsonify, url_for, send_from_directory, make_response
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
import os
import zipfile
from werkzeug.utils import secure_filename
from flask_cors import CORS
import json
import numpy as np
from hitungancolor import imageBlockToHistogram, cosineSimilarity
from hitungantexture import convertImageToGrayScale, createOccurenceMatrix, getTextureFeatures, cosineSimilarityTexture
import time
from multiprocessing import Pool
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, parse_qs
import mimetypes


app = Flask(__name__, static_folder='static/image')


CORS(app)

image_dir = 'static/image'
os.makedirs(image_dir, exist_ok=True)


def process_single_image(image_path):
    if image_path.lower().endswith(('.png', '.jpg', '.jpeg')):
        # Process color histograms
        block_histograms = imageBlockToHistogram(image_path)

        # Process texture features
        gray_scale_image = convertImageToGrayScale(image_path)
        occurrence_matrix = createOccurenceMatrix(gray_scale_image)
        texture_features = getTextureFeatures(occurrence_matrix)

        return {
            'path': os.path.basename(image_path),
            'color': [hist.tolist() for hist in block_histograms],
            'texture': texture_features.tolist()
        }
    return None


def process_images_to_json(image_folder, batch_size=50):
    image_paths = [os.path.join(image_folder, img)
                   for img in os.listdir(image_folder)]
    batches = [image_paths[i:i + batch_size]
               for i in range(0, len(image_paths), batch_size)]

    all_features = {}
    with Pool() as pool:
        for batch in batches:
            results = pool.map(process_single_image, batch)
            for result in results:
                if result:
                    all_features[result['path']] = {
                        'color': result['color'],
                        'texture': result['texture']
                    }

    with open('image_features.json', 'w') as file:
        json.dump(all_features, file)


def clear_image_directory(directory):
    """Remove all files in the specified directory."""
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        if os.path.isfile(item_path):
            os.remove(item_path)


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/upload', methods=['POST'])
def upload_file():

    start_time = time.time()

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    clear_image_directory(image_dir)

    # Save the ZIP file temporarily
    temp_zip_path = os.path.join(image_dir, 'temp.zip')
    file.save(temp_zip_path)

    allowed_extensions = {'jpg', 'jpeg', 'png'}
    try:
        with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
            for file_info in zip_ref.infolist():
                if file_info.filename.split('.')[-1].lower() in allowed_extensions:
                    file_info.filename = os.path.basename(file_info.filename)
                    zip_ref.extract(file_info, image_dir)
    except zipfile.BadZipFile:
        return jsonify({"error": "Invalid ZIP file"}), 400
    finally:
        os.remove(temp_zip_path)

    extraction_time = time.time()

    # Process the extracted images and create a JSON file
    process_images_to_json(image_dir)
    processing_time = time.time()
    total_time = processing_time - start_time
    print(f"Total Time: {total_time:.2f} seconds")
    print(f"Extraction Time: {extraction_time - start_time:.2f} seconds")
    print(f"Processing Time: {processing_time - extraction_time:.2f} seconds")
    return jsonify({"message": "File uploaded, extracted, and processed successfully"}), 200


@app.route('/images/<filename>')
def send_image(filename):
    return send_from_directory('static/image', filename)


@app.route('/search', methods=['POST'])
def search_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    target_file = request.files['file']
    if target_file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    start_time = time.time()
    search_type = request.args.get('type', 'color')

    with open('image_features.json', 'r') as json_file:
        image_features = json.load(json_file)

    if search_type == 'color':
        target_features = [np.array(hist)
                           for hist in imageBlockToHistogram(target_file)]
    else:
        gray_scale_image = convertImageToGrayScale(target_file)
        occurrence_matrix = createOccurenceMatrix(gray_scale_image)
        target_features = np.array(getTextureFeatures(occurrence_matrix))

    similarities = {}
    for image_name, features in image_features.items():
        if search_type == 'color':
            total_similarity = sum(cosineSimilarity(np.array(hist), target_hist)
                                   for hist, target_hist in zip(features['color'], target_features))
            avg_similarity = total_similarity / len(target_features)
        else:
            avg_similarity = cosineSimilarityTexture(
                features['texture'], target_features)

        if avg_similarity >= 0.6:
            similarities[image_name] = avg_similarity

    end_time = time.time()
    search_duration = end_time - start_time

    # Sorting and storing similarities
    sorted_similarities = sorted(
        similarities.items(), key=lambda x: x[1], reverse=True)
    paginated_results = sorted_similarities[:6]  # First page results

    # Store results in JSON
    with open('search_results.json', 'w') as file:
        json.dump({
            "total_images": len(sorted_similarities),
            "search_duration": search_duration,
            "sorted_similarities": sorted_similarities
        }, file)

    # Response for the first page
    response_data = {
        "search_duration": search_duration,
        "total_images": len(sorted_similarities),
        "current_page": 1,
        "total_pages": len(sorted_similarities) // 6 + (1 if len(sorted_similarities) % 6 else 0),
        "images": [
            {
                "image_name": image_name,
                "image_url": url_for('send_image', filename=image_name),
                "similarity": round(similarity * 100, 5)
            }
            for image_name, similarity in paginated_results
        ]
    }
    return jsonify(response_data), 200


@app.route('/change_page', methods=['GET'])
def change_page():
    page = int(request.args.get('page', 1))
    per_page = 6

    # Read the stored results
    with open('search_results.json', 'r') as file:
        data = json.load(file)

    start_index = (page - 1) * per_page
    end_index = start_index + per_page
    paginated_results = data["sorted_similarities"][start_index:end_index]

    # Constructing paginated response
    response_data = {
        "search_duration": data["search_duration"],
        "total_images": data["total_images"],
        "current_page": page,
        "total_pages": data["total_images"] // per_page + (1 if data["total_images"] % per_page else 0),
        "images": [
            {
                "image_name": image_name,
                "image_url": url_for('send_image', filename=image_name),
                "similarity": round(similarity*100, 5)
            }
            for image_name, similarity in paginated_results
        ]
    }
    return jsonify(response_data), 200


def generate_pdf(sorted_similarities, total_images, search_duration):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y_position = height - 30  # Start from top

    # Adding summary information at the beginning of the PDF
    c.drawString(30, y_position, f"Total Images: {total_images}")
    y_position -= 20
    c.drawString(30, y_position,
                 f"Search Duration: {search_duration:.2f} seconds")
    y_position -= 40  # Adjust position for first image

    for image_name, similarity in sorted_similarities:
        # Check space and add new page
        if y_position < 200:
            c.showPage()
            y_position = height - 30

        # Text for image name and similarity
        c.drawString(
            30, y_position, f"{image_name} - Similarity: {round(similarity * 100, 5)}%")
        y_position -= 10  # text position

        # Load and draw the image directly from static folder
        image_path = os.path.join('static', 'image', image_name)
        if os.path.exists(image_path):
            c.drawImage(image_path, 30, y_position - 150,
                        width=200, height=150)  # Adjust image position

        y_position -= 175  # Adjust for next image

    c.save()
    buffer.seek(0)
    return buffer


@app.route('/download_pdf', methods=['GET'])
def download_pdf():
    with open('search_results.json', 'r') as file:
        data = json.load(file)
        sorted_similarities = data["sorted_similarities"]
        total_images = data["total_images"]
        search_duration = data["search_duration"]

    pdf_buffer = generate_pdf(
        sorted_similarities, total_images, search_duration)
    response = make_response(pdf_buffer.getvalue())
    response.headers['Content-Type'] = 'application/pdf'
    response.headers['Content-Disposition'] = 'attachment; filename=sorted_similarities.pdf'
    return response


@app.route('/scrape_images', methods=['POST'])
def scrape_images():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        images = soup.find_all('img')
        saved_images_count = 0
        clear_image_directory(image_dir)
        for img in images:
            src = img.get('src')

            if not src or src.startswith('data:'):
                continue  # Skip data URLs

            # Handle relative URLs
            if not src.startswith('http'):
                src = urljoin(url, src)

            parse_url = urlparse(src)
            query_url = parse_qs(parse_url.query)

            if 'url' in query_url:
                image_path = query_url['url'][0]
                src = urlparse(url).scheme + "://" + \
                    urlparse(url).netloc + image_path

            image_res = requests.get(src)
            if (image_res.status_code != 200):
                continue

            type = image_res.headers['Content-Type']
            extension = mimetypes.guess_extension(type)

            if extension != None:
                if extension in ['.jpg', '.jpeg', '.png']:
                    image_file_name = f'image_{saved_images_count}{extension}'
                    with open(os.path.join(image_dir, image_file_name), 'wb') as file:
                        file.write(image_res.content)
                    saved_images_count += 1

        # After saving images, process them
        process_images_to_json(image_dir)

        return jsonify({'message': f'Successfully scraped and processed {saved_images_count} images'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/upload_batch', methods=['POST'])
def upload_batch():
    start_time = time.time()

    files = request.files.getlist('file')
    if not files or all(file.filename == '' for file in files):
        return jsonify({"error": "No files found in the batch"}), 400
    # Check if this is a new upload process
    isNewUpload = request.form.get('isNewUpload') == 'true'

    if isNewUpload:
        clear_image_directory(image_dir)

    for key in request.files:
        if key != 'isNewUpload':  # Skip the flag
            file = request.files[key]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(image_dir, filename))

    # Process files after batch upload
    process_images_to_json(image_dir)
    processing_time = time.time()
    total_time = processing_time - start_time
    print(f"Total Time: {total_time:.2f} seconds")

    return jsonify({"message": "Batch upload successful"}), 200


if __name__ == '__main__':
    app.run(debug=True)
