let leftPhoto = document.getElementById('photo-left')
let rightPhoto = document.getElementById('photo-right')
let container = document.querySelector('.photo-container')

// Загружаем начальные фотографии при старте
async function loadInitialPhotos() {
	try {
		const response = await fetch('/start')
		if (!response.ok) {
			const errorData = await response.json()
			alert('Ошибка: ' + (errorData.error || 'Неизвестная ошибка'))
			return
		}
		const data = await response.json()
		updatePhotos(data.leftPhoto, data.rightPhoto)
	} catch (err) {
		console.error('Ошибка загрузки начальных фотографий:', err)
		alert('Ошибка подключения к серверу')
	}
}

function updatePhotos(left, right) {
	leftPhoto.src = left
	rightPhoto.src = right
	leftPhoto.classList.remove('fade-in')
	rightPhoto.classList.remove('fade-in')

	// Убираем увеличение на фотографиях перед загрузкой новых
	leftPhoto.classList.remove('selected')
	rightPhoto.classList.remove('selected')
	leftPhoto.style.transform = 'scale(1)'
	rightPhoto.style.transform = 'scale(1)'
}

leftPhoto.addEventListener('click', () => {
	vote('left')
})
rightPhoto.addEventListener('click', () => {
	vote('right')
})

async function vote(choice) {
	const selectedPhoto = choice === 'left' ? leftPhoto : rightPhoto
	const otherPhoto = choice === 'left' ? rightPhoto : leftPhoto

	// Добавляем класс выбранной фотографии для анимации увеличения
	selectedPhoto.classList.add('selected')
	otherPhoto.classList.add('fade-out')

	// Ждем завершения анимации
	await new Promise(resolve => setTimeout(resolve, 500))

	// Отправляем выбор на сервер
	const response = await fetch('/vote', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ choice }),
	})

	if (response.ok) {
		const data = await response.json()

		if (data.top) {
			showTop10(data.top) // Показываем топ-10
		} else {
			// Сбрасываем увеличенную фотографию
			leftPhoto.classList.remove('selected')
			rightPhoto.classList.remove('selected')
			leftPhoto.style.transform = 'scale(1)'
			rightPhoto.style.transform = 'scale(1)'

			otherPhoto.classList.remove('fade-out')

			updatePhotos(data.leftPhoto, data.rightPhoto)

			// Добавляем эффект появления
			leftPhoto.classList.add('fade-in')
			rightPhoto.classList.add('fade-in')

			setTimeout(() => {
				leftPhoto.classList.remove('fade-in')
				rightPhoto.classList.remove('fade-in')
			}, 500)
		}
	} else {
		alert('Ошибка при голосовании')
	}
}

function showTop10(top) {
	container.innerHTML = '<h2>Топ-10 красивых девушек</h2>'

	// Создаем контейнер для вертикального списка
	const list = document.createElement('div')
	list.classList.add('top10-list')

	top.forEach((entry, index) => {
		const div = document.createElement('div')
		div.classList.add('top10-item')

		div.innerHTML = `
            <div class="top10-rank">${index + 1}.</div>
            <img src="/images/${entry.photo}" alt="Фото" class="top10-photo">
            <p class="top10-score">${entry.score} баллов</p>
        `
		list.appendChild(div)
	})

	// Добавляем список в контейнер
	container.appendChild(list)
}

// Загружаем начальные фотографии
loadInitialPhotos()
