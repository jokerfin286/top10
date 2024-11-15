from flask import Flask, jsonify, request, send_from_directory, render_template, session
import os
import random

app = Flask(__name__)
app.secret_key = os.urandom(24)  # Секретный ключ для сессий

# Загрузка всех фотографий из папки 'images' с начальным счётом 0
def load_photos():
    """Загружает все фотографии из папки 'images'."""
    return {f: 0 for f in os.listdir('images') if f.lower().endswith(('.jpg', '.jpeg', '.png'))}

photos = load_photos()  # Словарь вида {"photo1.jpg": 0, "photo2.jpg": 0, ...}
used_photos = set()     # Набор уже выбранных фотографий для предотвращения повторений

def get_random_photo(exclude=[]):
    """Возвращает случайное фото, исключая переданные."""
    candidates = [p for p in photos.keys() if p not in exclude and p not in used_photos]
    return random.choice(candidates) if candidates else None

@app.route('/')
def index():
    """Главная страница."""
    # Очищаем информацию о выбранных фотографиях при перезапуске
    session.pop('current_photos', None)
    session.pop('used_photos', None)
    return render_template('index.html')

@app.route('/start', methods=['GET'])
def start():
    """Инициализирует первые фотографии."""
    # Проверяем, есть ли в сессии сохраненные фотографии
    if 'current_photos' not in session or 'used_photos' not in session:
        # Если нет, начинаем голосование заново
        if len(photos) < 2:
            return jsonify({"error": "Недостаточно фотографий для начала"}), 400

        # Начинаем с пустых выбранных фотографий
        current_photos = [get_random_photo(), get_random_photo()]
        while current_photos[0] == current_photos[1]:
            current_photos[1] = get_random_photo()

        # Сохраняем их в сессию
        session['current_photos'] = current_photos
        session['used_photos'] = list(current_photos)  # Сохраняем как список

    else:
        current_photos = session['current_photos']

    return jsonify({
        "leftPhoto": f"/images/{current_photos[0]}",
        "rightPhoto": f"/images/{current_photos[1]}"
    })

@app.route('/vote', methods=['POST'])
def vote():
    """Обрабатывает голосование."""
    data = request.json
    choice = data.get('choice')

    if choice not in ["left", "right"]:
        return jsonify({"error": "Неверный выбор"}), 400

    current_photos = session['current_photos']
    selected_index = 0 if choice == "left" else 1
    selected_photo = current_photos[selected_index]
    photos[selected_photo] += 1

    # Не меняем выбранную фотографию, меняем невыбранную
    other_photo = current_photos[1] if choice == "left" else current_photos[0]

    # Заменяем невыбранную фотографию на случайную
    new_photo = get_random_photo(exclude=current_photos)
    if new_photo:
        current_photos[1 - selected_index] = new_photo
        session['current_photos'] = current_photos
        used_photos.add(new_photo)
        session['used_photos'] = list(used_photos)  # Сохраняем как список
        return jsonify({
            "leftPhoto": f"/images/{current_photos[0]}",
            "rightPhoto": f"/images/{current_photos[1]}"
        })
    else:
        # Если новых фотографий нет, возвращаем топ-1
        top_10 = sorted(photos.items(), key=lambda x: x[1], reverse=True)[:10]
        return jsonify({"top": [{"photo": k, "score": v} for k, v in top_10]})

@app.route('/images/<filename>')
def get_image(filename):
    """Раздаёт изображения из папки."""
    return send_from_directory('images', filename)

if __name__ == '__main__':
    app.run(debug=True)
