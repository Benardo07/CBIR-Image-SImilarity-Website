from PIL import Image
import numpy as np
import time
import math


def convertImageToGrayScale(Path):
    np.seterr(divide='ignore', invalid='ignore')
    img = Image.open(Path)

    if img.width > 1080:
        w = 1080
        h = int(img.height/img.width * 1080)
        img = img.resize((w, h))

    # Convert image to RGB if it's not already
    if img.mode != 'RGB':
        img = img.convert('RGB')

    img_np = np.array(img)
    R, G, B = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
    grayImg = 0.29 * R + 0.587 * G + 0.114 * B
    return grayImg.astype(np.int64)


def createOccurenceMatrix(grayImg):
    grayImg = np.array(grayImg)
    occMat = np.zeros((256, 256))
    i_values, j_values = grayImg[:-1, :-1], grayImg[:-1, 1:]
    np.add.at(occMat, (i_values, j_values), 1)
    normmat = (occMat + np.transpose(occMat))
    normmat = normmat/np.sum(normmat)
    return normmat


def getTextureFeatures(occMat):
    occMat = np.array(occMat)
    i_values, j_values = np.meshgrid(
        np.arange(256), np.arange(256), indexing='ij')
    dissimilarity = np.sum(occMat * np.abs(i_values - j_values))
    contrast = np.sum(occMat * (i_values - j_values)**2)
    homogeneity = np.sum(occMat / (1 + (i_values - j_values)**2))
    # Menghindari log 0
    epsilon = 1e-10
    entropy = np.sum(occMat * np.log(occMat + epsilon))
    return np.array([contrast, -dissimilarity, homogeneity, -entropy])


def cosineSimilarityTexture(a, b):
    a = np.array(a).astype(np.int64)
    b = np.array(b).astype(np.int64)
    dot_product = np.dot(a, b)
    lengtha = math.sqrt(np.dot(a, a))
    lengthb = math.sqrt(np.dot(b, b))
    result = dot_product / (lengtha * lengthb)
    return result
