#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/website"
IMG="$OUT/images"
DATA="$OUT/data"
JS_DATA="$OUT/js/gallery-data.js"

slugify() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9\/-]//g'
}

rm -rf "$IMG"
mkdir -p "$IMG" "$DATA" "$OUT/js"

GALLERY="$DATA/gallery.json"
echo "{" > "$GALLERY"
echo '  "categories": [' >> "$GALLERY"

FIRST=1
HERO_PATH=""

add_category() {
  local id="$1" title="$2" desc="$3"
  if [ "$FIRST" -eq 0 ]; then echo "," >> "$GALLERY"; fi
  FIRST=0
  cat >> "$GALLERY" <<EOF
    {
      "id": "$id",
      "title": "$title",
      "description": "$desc",
      "images": [
EOF
}

close_category() {
  echo "" >> "$GALLERY"
  echo "      ]" >> "$GALLERY"
  echo -n "    }" >> "$GALLERY"
}

convert_image() {
  local src="$1" rel_dir="$2" basename="$3" cat_title="$4"
  local slug_dir
  slug_dir="$(slugify "$rel_dir")"
  local dest_dir="$IMG/$slug_dir"
  local thumb_dir="$IMG/$slug_dir/thumbs"
  mkdir -p "$dest_dir" "$thumb_dir"

  local out_name="${basename%.*}.jpg"
  local out_full="$dest_dir/$out_name"
  local out_thumb="$thumb_dir/$out_name"
  local web_path="images/$slug_dir/$out_name"
  local thumb_path="images/$slug_dir/thumbs/$out_name"

  if [[ "${src##*.}" =~ ^([Hh][Ee][Ii][Cc]|[Hh][Ee][Ii][Ff])$ ]]; then
    sips -s format jpeg "$src" --out "$out_full" >/dev/null 2>&1
  else
    cp "$src" "$out_full"
  fi

  sips -Z 800 "$out_full" --out "$out_thumb" >/dev/null 2>&1
  sips -Z 2400 "$out_full" --out "$out_full" >/dev/null 2>&1

  if [[ "$rel_dir" == *"North View/Summer"* && "$basename" == "IMG_20210522_204227.jpg" && -z "$HERO_PATH" ]]; then
    HERO_PATH="$web_path"
  fi

  if [ "$IMG_FIRST" -eq 0 ]; then echo "," >> "$GALLERY"; fi
  IMG_FIRST=0
  cat >> "$GALLERY" <<EOF
        {
          "src": "$web_path",
          "thumb": "$thumb_path",
          "alt": "$cat_title"
        }
EOF
}

process_folder() {
  local folder="$1" id="$2" title="$3" desc="$4"
  local src_dir="$ROOT/$folder"
  [ -d "$src_dir" ] || return

  add_category "$id" "$title" "$desc"
  IMG_FIRST=1

  while IFS= read -r -d '' file; do
    rel="${file#$ROOT/}"
    rel_dir="$(dirname "$rel")"
    basename="$(basename "$file")"
    if [ "$basename" = "IMG_2388.HEIC" ] || [ "$basename" = "IMG_2388.jpg" ]; then
      continue
    fi
    convert_image "$file" "$rel_dir" "$basename" "$title"
  done < <(find "$src_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.heic" -o -iname "*.heif" -o -iname "*.png" \) ! -name ".DS_Store" -print0 | sort -z)

  close_category
}

process_folder "Hallway" "hallway" "Hallway" "Welcoming entrance with fresh paint throughout"
process_folder "Living room" "living-room" "Living Room" "Spacious living area with new flooring and fresh paint"
process_folder "Kitchen" "kitchen" "Kitchen" "Brand new kitchen with modern finishes"
process_folder "Bedroom-1" "bedroom-1" "Bedroom 1" "Comfortable bedroom with natural light"
process_folder "Bedroom-2" "bedroom-2" "Bedroom 2" "Versatile second bedroom"
process_folder "Outside view" "views" "Views" "Panoramic open views from the 9th floor – east and north"

if [ -z "$HERO_PATH" ]; then
  HERO_PATH="images/outside-view/north-view/summer/IMG_20210522_204227.jpg"
fi

echo "" >> "$GALLERY"
echo "  ]," >> "$GALLERY"
echo "  \"hero\": \"$HERO_PATH\"," >> "$GALLERY"
echo '  "heroAlt": "Summer view from the apartment – North facing"' >> "$GALLERY"
echo "}" >> "$GALLERY"

# Also emit as JS so the site works when opened directly (file://) without fetch
{
  echo "window.GALLERY_DATA = "
  cat "$GALLERY"
  echo ";"
} > "$JS_DATA"

echo "Build complete."
echo "  Gallery JSON: $GALLERY"
echo "  Gallery JS:   $JS_DATA"
