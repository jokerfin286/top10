let leftPhoto = document.getElementById('photo-left');
let rightPhoto = document.getElementById('photo-right');
let container = document.querySelector('.photo-container');

// Список всех изображений с баллами
const images = [
    '1-1.jpg',
    '1 (2).jpg',
    '1 (3).jpg',
    '1 (4).jpg',
    '1 (5).jpg',
    '1 (6).jpg',
    '1 (7).jpg',
    '1 (8).jpg',
    '1 (9).jpg',
    '1 (10).jpg',
    '1 (11).jpg',
    '1 (12).jpg',
    '1 (13).jpg',
    '1 (14).jpg',
    '1 (15).jpg',
    '1 (16).jpg',
    '1 (17).jpg',
    '1 (18).jpg',
    '1 (19).jpg',
    '1 (20).jpg',
    '1 (21).jpg',
    '1 (22).jpg',
    '1 (23).jpg',
    '1 (24).jpg',
    '1 (25).jpg',
    '1 (26).jpg',
    '1 (27).jpg',
    '1 (28).jpg',
    '1 (29).jpg',
    '1 (30).jpg',
    '1 (31).jpg',
    '1 (32).jpg',
    '1 (33).jpg',
    '1 (34).jpg',
    '1 (35).jpg',
    '1 (36).jpg',
    '1 (37).jpg',
    '1 (38).jpg',
    '1 (39).jpg',
    '1 (40).jpg',
    '1 (41).jpg',
    '1 (42).jpg',
    '1 (43).jpg',
    '1 (44).jpg',
    '1 (45).jpg',
    '1 (46).jpg',
    '1 (47).jpg',
    '1 (48).jpg',
    '1 (49).jpg',
    '1 (50).jpg',
    '1 (51).jpg',
    '1 (52).jpg',
    '1 (53).jpg',
    '1 (54).jpg',
    '1 (55).jpg',
    '1 (56).jpg',
    '1 (57).jpg',
    '1 (58).jpg',
    '1 (59).jpg',
    '1 (60).jpg',
    '1 (61).jpg',
    '1 (62).jpg',
    '1 (63).jpg',
    '1 (64).jpg',
    '1 (65).jpg',
    '1 (66).jpg',
    '1 (67).jpg',
    '1 (68).jpg',
    '1 (69).jpg',
    '1 (70).jpg',
];

// Массив для хранения баллов и состояния фотографий
const photos = images.map(image => ({
    src: `images/${image}`, // Изменили путь на относительный
    score: 0,
    selected: false,
}));

let leftPhotoData;
let rightPhotoData;

// Функция для получения случайных двух фотографий
function getRandomPhotos() {
    const availablePhotos = photos.filter(photo => !photo.selected);
    if (availablePhotos.length < 2) {
        showTop10(); // Когда все фотографии были выбраны, показываем топ-10
        return null;
    }

    const randomIndex1 = Math.floor(Math.random() * availablePhotos.length);
    let randomIndex2 = Math.floor(Math.random() * availablePhotos.length);
    while (randomIndex1 === randomIndex2) {
        randomIndex2 = Math.floor(Math.random() * availablePhotos.length);
    }

    leftPhotoData = availablePhotos[randomIndex1];
    rightPhotoData = availablePhotos[randomIndex2];

    return [leftPhotoData, rightPhotoData];
}

// Функция для обновления фотографий на странице
function updatePhotos(left, right) {
    leftPhoto.src = left.src;
    rightPhoto.src = right.src;
    leftPhoto.classList.remove('fade-in');
    rightPhoto.classList.remove('fade-in');

    leftPhoto.classList.remove('selected');
    rightPhoto.classList.remove('selected');
    leftPhoto.style.transform = 'scale(1)';
    rightPhoto.style.transform = 'scale(1)';
}

// Функция для голосования
async function vote(choice) {
    const selectedPhoto = choice === 'left' ? leftPhoto : rightPhoto;
    const otherPhoto = choice === 'left' ? rightPhoto : leftPhoto;

    const selectedPhotoData = choice === 'left' ? leftPhotoData : rightPhotoData;
    selectedPhotoData.score += 1;
    selectedPhotoData.selected = true; // Фото помечается как выбранное

    selectedPhoto.classList.add('selected');
    otherPhoto.classList.add('fade-out');

    setTimeout(() => {
        leftPhoto.classList.remove('selected');
        rightPhoto.classList.remove('selected');
        leftPhoto.style.transform = 'scale(1)';
        rightPhoto.style.transform = 'scale(1)';
        otherPhoto.classList.remove('fade-out');

        // Получаем новые фотографии для следующего голосования
        const nextPhotos = getRandomPhotos();
        if (nextPhotos) {
            // Заменяем только невыбранную фотографию
            if (choice === 'left') {
                updatePhotos(nextPhotos[0], rightPhotoData);
            } else {
                updatePhotos(leftPhotoData, nextPhotos[1]);
            }

            leftPhoto.classList.add('fade-in');
            rightPhoto.classList.add('fade-in');
        }
    }, 500);
}

// Функция для отображения топ-10
function showTop10() {
    const top10 = photos.sort((a, b) => b.score - a.score).slice(0, 10);

    container.innerHTML = '<h2>Топ-10 самых красивых девушек</h2>';
    const list = document.createElement('div');
    list.classList.add('top10-list');

    top10.forEach((photo, index) => {
        const div = document.createElement('div');
        div.classList.add('top10-item');

        div.innerHTML = `
            <div class="top10-rank">${index + 1}</div>
            <img src="${photo.src}" alt="Фото" class="top10-photo">
            <div class="top10-score">${photo.score} баллов</div>
        `;
        list.appendChild(div);
    });

    container.appendChild(list);
}

// Обработчики событий для выбора фото
leftPhoto.addEventListener('click', () => vote('left'));
rightPhoto.addEventListener('click', () => vote('right'));

// Инициализация фотографий
const initialPhotos = getRandomPhotos();
if (initialPhotos) {
    updatePhotos(initialPhotos[0], initialPhotos[1]);
}
