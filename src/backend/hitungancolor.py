from PIL import Image
import numpy as np
import time


import numpy as np


def rgb_to_hsv(img_np):
    img_np = img_np / 255.0

    r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
    cmax = np.maximum.reduce([r, g, b])
    cmin = np.minimum.reduce([r, g, b])
    delta = cmax - cmin

    h = np.zeros_like(cmax)
    s = np.zeros_like(cmax)
    v = cmax

    # Calculate Hue
    mask = delta != 0
    mask_r = (cmax == r) & mask
    mask_g = (cmax == g) & mask
    mask_b = (cmax == b) & mask

    delta_safe = np.where(delta == 0, 1, delta)  # Avoid division by zero

    h[delta == 0] = 0
    h[mask_r] = 60 * (((g - b) / delta_safe)[mask_r] % 6)
    h[mask_g] = 60 * (((b - r) / delta_safe)[mask_g] + 2)
    h[mask_b] = 60 * (((r - g) / delta_safe)[mask_b] + 4)

    # Calculate Saturation
    s[cmax != 0] = delta[cmax != 0] / v[cmax != 0]
    s[cmax == 0] = 0

    h, s, v = hsv_to_hsvFeature(h, s, v)

    # Combine H, S, V into one matrix
    hsv = np.stack((h, s, v), axis=-1)

    return hsv


def hsv_to_hsvFeature(h, s, v):
    h0 = ((h >= 316) & (h <= 360)) | (h == 0)
    h1 = (1 <= h) & (h < 26)
    h2 = (26 <= h) & (h < 41)
    h3 = (41 <= h) & (h < 121)
    h4 = (121 <= h) & (h < 191)
    h5 = (191 <= h) & (h < 271)
    h6 = (271 <= h) & (h < 295)
    h7 = (295 <= h) & (h < 316)

    s0 = (0 <= s) & (s < 0.2)
    s1 = (0.2 <= s) & (s < 0.7)
    s2 = (0.7 <= s) & (s <= 1)

    v0 = (0 <= v) & (v < 0.2)
    v1 = (0.2 <= v) & (v < 0.7)
    v2 = (0.7 <= v) & (v <= 1)

    h[h0] = 0
    h[h1] = 1
    h[h2] = 2
    h[h3] = 3
    h[h4] = 4
    h[h5] = 5
    h[h6] = 6
    h[h7] = 7

    s[s0] = 0
    s[s1] = 1
    s[s2] = 2

    v[v0] = 0
    v[v1] = 1
    v[v2] = 2

    return h, s, v


def makeHistogram(array):

    indices = array[:, :, 0]*9 + array[:, :, 1]*3 + array[:, :, 2]
    indices = indices.flatten()

    temp_arr = np.zeros(72, dtype=int)

    np.add.at(temp_arr, indices, 1)

    return temp_arr


def process_block(img_np, x_start, x_end, y_start, y_end):
    block = img_np[x_start:x_end, y_start:y_end, :]
    hsv_arr = rgb_to_hsv(block)
    hsv_arr_int = hsv_arr.astype("int64")
    return makeHistogram(hsv_arr_int)


def imageBlockToHistogram(image_path):
    img = Image.open(image_path)
    if img.width > 1080:
        w = 1080
        h = int(img.height/img.width * 1080)
        img = img.resize((w, h))

    if img.mode != 'RGB':
        img = img.convert('RGB')
    img_np = np.array(img)

    histograms = []
    for i in range(4):
        for j in range(4):
            x_start, x_end = i * img.height // 4, (i + 1) * img.height // 4
            y_start, y_end = j * img.width // 4, (j + 1) * img.width // 4
            histograms.append(process_block(
                img_np, x_start, x_end, y_start, y_end))

    return histograms


def cosineSimilarity(vector1, vector2):
    vector1 = np.array(vector1).astype(np.int64).flatten()
    vector2 = np.array(vector2).astype(np.int64).flatten()
    dot_product = np.dot(vector1, vector2)
    length_vector1 = np.linalg.norm(vector1)
    length_vector2 = np.linalg.norm(vector2)

    # Avoid division by zero
    if length_vector1 == 0 or length_vector2 == 0:
        return 0

    return dot_product / (length_vector1 * length_vector2)
