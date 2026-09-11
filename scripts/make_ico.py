import sys
from PIL import Image

def main():
    fav48 = sys.argv[1]
    fav_ico = sys.argv[2]
    im = Image.open(fav48)
    im.save(fav_ico, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated multi-size ICO at {fav_ico}")

if __name__ == "__main__":
    main()
