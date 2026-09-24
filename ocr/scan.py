import sys
import cv2

def scan(image_path):
    image = cv2.imread(image_path)
    if image is None:
        print("Impossible de lire l'image")
        return

    # QR code
    qr = cv2.QRCodeDetector()
    data, points, _ = qr.detectAndDecode(image)
    if data:
        print(f"QR code : {data}")
        return

    # Code-barres
    barcode = cv2.barcode.BarcodeDetector()
    ok, infos, types, _ = barcode.detectAndDecodeWithType(image)
    if ok and any(infos):
        for info, t in zip(infos, types):
            print(f"Code-barres ({t}) : {info}")
        return

    print("Aucun code détecté")

if __name__ == "__main__":
    scan(sys.argv[1])