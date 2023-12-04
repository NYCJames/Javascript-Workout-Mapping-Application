'use strict';

const form = document.querySelector('.form');
const form2 = document.querySelector('.form2');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const inputType2 = document.querySelector('.form2__input--type');
const inputDistance2 = document.querySelector('.form2__input--distance');
const inputDuration2 = document.querySelector('.form2__input--duration');
const inputCadence2 = document.querySelector('.form2__input--cadence');
const inputElevation2 = document.querySelector('.form2__input--elevation');

// console.log(navigator.language);
// console.log(navigator.languages);

// console.log(document.querySelector(`script`));

// document
//   .querySelector(`script`)
//   .insertAdjacentHTML(
//     `beforebegin`,
//     `<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /> \n <script async src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>`
//   );

class App {
  #map;
  #mapEvent;
  #mapZoomLevel = 15;
  #allWorkouts = [];
  #editTarget;

  constructor() {
    this._getPosition();
    // setTimeout(this._retrieveFromLocalStorage().bind(this), 1500);
    form.addEventListener(`submit`, this._newWorkout.bind(this));
    form2.addEventListener(`submit`, this._editWorkout.bind(this));
    inputType.addEventListener(`change`, this._toggleInputField);
    inputType2.addEventListener(`change`, this._toggleEditInputField);
    containerWorkouts.addEventListener(`click`, this._panToWorkout.bind(this));
  }

  _getPosition() {
    // Get location

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function error(code) {
          alert(
            `Could not retrieve location\nCode: ${code.code}\n${code.message}`
          );
          const errorPosition = { coords: { latitude: 0, longitude: 0 } };
          this._loadMap(errorPosition);
        }.bind(this)
      );
    }
  }

  _loadMap(position) {
    // console.log(`location success`, position);

    const { latitude, longitude } = position.coords;
    // console.log(latitude, longitude);

    const coordinates = [latitude, longitude];

    this.#map = L.map('map').setView(coordinates, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));

    this._retrieveFromLocalStorage();

    this.#map.setView(coordinates, this.#mapZoomLevel);
  }

  _showForm(event) {
    this.#mapEvent = event;
    // console.log(this.#mapEvent);

    form.classList.remove(`hidden`);
    inputDistance.focus();
  }

  _showEditForm() {
    // this.#mapEvent = event;
    // console.log(this.#mapEvent);

    form2.classList.remove(`hidden`);
    inputDistance.focus();
  }

  _hideForm() {
    // event.preventDefault();

    form.style.display = `none`;
    form.classList.add(`hidden`);
    setTimeout(function () {
      form.style.display = `grid`;
    }, 500);

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        ``;
  }

  _hideEditForm() {
    // event.preventDefault();

    form2.style.display = `none`;
    form2.classList.add(`hidden`);
    setTimeout(function () {
      form2.style.display = `grid`;
    }, 500);

    inputCadence2.value =
      inputDistance2.value =
      inputDuration2.value =
      inputElevation2.value =
        ``;
  }

  _toggleInputField() {
    // console.log(event);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  _toggleEditInputField() {
    // console.log(event);
    inputElevation2
      .closest(`.form2__row`)
      .classList.toggle(`form2__row--hidden`);
    inputCadence2.closest(`.form2__row`).classList.toggle(`form2__row--hidden`);
  }

  _createMapPopup(workout) {
    L.marker(workout.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          // closeButton: true,
          autoClose: false,
          closeOnEscapeKey: false,
          closeOnClick: false,
          maxWidth: 450,
          minWidth: 50,
          className: `${workout.activity.toLowerCase()}-popup`,
        })
      )
      .setPopupContent(
        `${workout.activity === `Running` ? `🏃‍♂️` : `🚴‍♀️`} ${workout.description}`
      )
      .openPopup();
  }

  _checkIfNumber(...inputs) {
    // console.log(inputs);
    return inputs.every(function (testField) {
      // console.log(testField);
      return Number.isFinite(testField);
    });
  }

  _checkIfPositive(...inputs) {
    return inputs.every(function (testField) {
      return testField > 0;
    });
  }

  _newWorkout(event) {
    event.preventDefault();

    const workoutType = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = Number(inputDuration.value);
    let workout;

    // console.log(this.#mapEvent.latlng);
    const { lat: clickedLatitude, lng: clickedLongitude } =
      this.#mapEvent.latlng;
    // console.log(clickedLatitude, clickedLongitude);
    const coordinates = [clickedLatitude, clickedLongitude];

    if (workoutType === `running`) {
      const cadence = Number(inputCadence.value);
      // console.log(distance, duration, cadence);
      if (
        !this._checkIfNumber(distance, duration, cadence) ||
        !this._checkIfPositive(distance, duration, cadence)
      ) {
        // console.log(checkIfNumber(distance, duration, cadence));
        return alert(`Input Error`);
      }
      workout = new Running(coordinates, distance, duration, cadence);
    } else if (workoutType === `cycling`) {
      const elevation = Number(inputElevation.value);
      if (
        !this._checkIfNumber(distance, duration, elevation) ||
        !this._checkIfPositive(distance, duration)
      ) {
        // console.log(checkIfNumber(distance, duration, cadence));
        return alert(`Input Error`);
      }
      workout = new Cycling(coordinates, distance, duration, elevation);
    }

    this.#allWorkouts.push(workout);

    this._createMapPopup(workout);

    this._hideForm();

    this._renderWorkout(workout);

    this._pushToLocalStorage();
    // console.log(this.#allWorkouts);
  }

  _renderWorkout(workout) {
    // ${(workout.activity===`Running`)?`🏃‍♂️`:`🚴‍♀️`}
    const html1 = `<li class="workout workout--${workout.activity.toLowerCase()}" data-id="${
      workout.workoutNumber
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.activity === `Running` ? `🏃‍♂️` : `🚴‍♀️`
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${
        workout.activity === `Running`
          ? workout.pace.toFixed(2)
          : workout.speed.toFixed(2)
      }</span>
      <span class="workout__unit">${
        workout.activity === `Running` ? `min/km` : `km/h`
      }</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.activity === `Running` ? `🦶🏼` : `⛰`
      }</span>
      <span class="workout__value">${
        workout.activity === `Running` ? workout.cadence : workout.elevation
      }</span>
      <span class="workout__unit">${
        workout.activity === `Running` ? `spm` : `m`
      }</span>
    </div>
  </li>`;

    form.insertAdjacentHTML(`afterend`, html1);

    // console.log(form.innerHTML);
  }

  _clearWorkoutList() {
    document.querySelectorAll(`.workout`).forEach(function (workout) {
      workout.remove();
    });
  }

  _panToWorkout(event) {
    const target = event.target.closest(`.workout`);
    // console.log(target);

    if (!target) {
      return;
    }
    const targetID = Number(target.dataset.id);
    const workout = this.#allWorkouts.find(function (find) {
      return find.workoutNumber === targetID;
    });
    // console.log(workout);
    this.#map.setView(workout.coordinates, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 2 },
    });

    workout.addClick();
    this._pushToLocalStorage();
  }

  _pushToLocalStorage() {
    localStorage.setItem(`allWorkouts`, JSON.stringify(this.#allWorkouts));
  }

  _retrieveFromLocalStorage() {
    const oldData = JSON.parse(localStorage.getItem(`allWorkouts`));

    if (!oldData) {
      return;
    }

    oldData.forEach(
      function (value) {
        let fixedWorkout;
        value.date = new Date(value.date);
        if (value.activity === `Running`) {
          // fixedWorkout = new Running(
          //   value.coordinates,
          //   value.distance,
          //   value.duration,
          //   value.cadence
          // );
          fixedWorkout = Object.setPrototypeOf(value, new Running());
          // value.date = new Date(value.date);
        }

        if (value.activity === `Cycling`) {
          // fixedWorkout = new Cycling(
          //   value.coordinates,
          //   value.distance,
          //   value.duration,
          //   value.elevation
          // );
          fixedWorkout = Object.setPrototypeOf(value, new Cycling());
        }

        this.#allWorkouts.push(fixedWorkout);
        // console.log(this.#allWorkouts);
      }.bind(this)
    );

    // this.#allWorkouts = oldData;
    // console.log(this.#allWorkouts);

    this._renderOldWorkouts();
  }

  _renderOldWorkouts(sortBy) {
    // console.log(!sortBy);

    if (!sortBy) {
      this._clearWorkoutList();
      this.#allWorkouts.forEach(
        function (oldWorkout) {
          this._renderWorkout(oldWorkout);
          this._createMapPopup(oldWorkout);
          // console.log(this);
        }.bind(this)
      );
    } else {
      // location.reload();

      // console.log(sortBy);
      const sortedWorkouts = this.#allWorkouts.slice(0).sort(function (a, b) {
        // console.log(a[sortBy], b[sortBy]);
        return a[sortBy] - b[sortBy];
      });
      console.log(sortedWorkouts);
      this._clearWorkoutList();
      sortedWorkouts.forEach(
        function (sorted) {
          this._renderWorkout(sorted);
          // this._createMapPopup(sorted);
          // console.log(this);
        }.bind(this)
      );
    }
  }

  clearLocalStorage() {
    localStorage.removeItem(`allWorkouts`);
    location.reload();
  }

  viewAllWorkouts() {
    const allCoordinates = this.#allWorkouts.map(function (workouts) {
      return workouts.coordinates;
    });
    const center = L.PolyUtil.centroid(allCoordinates);
    // console.log(center);
    // this.#map.setView(center, this.#mapZoomLevel);
    // L.PolyUtil.centroid([[-156,159], [15,12], [1561, -165], [321, 123], [123, 321]])
    this.#map.flyToBounds(allCoordinates);
  }

  deleteWorkout(deleteTarget) {
    this.#allWorkouts = this.#allWorkouts.filter(function (find) {
      return find.workoutNumber !== Number(deleteTarget);
    });

    this._pushToLocalStorage();
    location.reload();
    this._renderOldWorkouts();
    // console.log(this.#allWorkouts);
  }

  deleteAllWorkouts() {
    this.#allWorkouts = [];

    this._pushToLocalStorage();
    // console.log(this.#allWorkouts);
    location.reload();
  }

  edit(editTarget) {
    this.#editTarget = this.#allWorkouts.find(function (workouts) {
      return workouts.workoutNumber === editTarget;
    });
    // console.log(this.#editTarget);

    if (this.#editTarget.activity === `Running`) {
      inputType2.options[0].selected = true;
      inputElevation2
        .closest(`.form2__row`)
        .classList.add(`form2__row--hidden`);
      inputCadence2
        .closest(`.form2__row`)
        .classList.remove(`form2__row--hidden`);
      inputCadence2.value = this.#editTarget.cadence;
      inputElevation2.value = ``;
    }

    if (this.#editTarget.activity === `Cycling`) {
      inputType2.options[1].selected = true;
      inputElevation2
        .closest(`.form2__row`)
        .classList.remove(`form2__row--hidden`);
      inputCadence2.closest(`.form2__row`).classList.add(`form2__row--hidden`);
      inputElevation2.value = this.#editTarget.elevation;
      inputCadence2.value = ``;
    }

    // inputType.options[activityMenu].selected = true;
    // console.log(inputType2.options);
    inputDistance2.value = this.#editTarget.distance;
    inputDuration2.value = this.#editTarget.duration;
    this._showEditForm();
  }

  _editWorkout(event) {
    event.preventDefault();

    const workoutType = inputType2.value;
    const distance = Number(inputDistance2.value);
    const duration = Number(inputDuration2.value);

    // console.log(this.#editTarget);
    // console.log(workoutType);

    if (workoutType === `running`) {
      const cadence = Number(inputCadence2.value);
      // console.log(distance, duration, cadence);
      if (
        !this._checkIfNumber(distance, duration, cadence) ||
        !this._checkIfPositive(distance, duration, cadence)
      ) {
        // console.log(checkIfNumber(distance, duration, cadence));
        return alert(`Input Error`);
      }
      // console.log(this.#allWorkouts[this.#editTarget]);
      Object.setPrototypeOf(this.#editTarget, new Running());
      delete this.#editTarget.elevation;
      this.#editTarget.activity = `Running`;
      this.#editTarget.distance = distance;
      this.#editTarget.duration = duration;
      this.#editTarget.cadence = cadence;
      // this.#editTarget.date = new Date(this.#editTarget.date);
      this.#editTarget.calcPace();
      this.#editTarget.createWorkoutDescription();
      // console.log(this.#editTarget.__proto__);
    } else if (workoutType === `cycling`) {
      const elevation = Number(inputElevation2.value);
      if (
        !this._checkIfNumber(distance, duration, elevation) ||
        !this._checkIfPositive(distance, duration)
      ) {
        // console.log(checkIfNumber(distance, duration, cadence));
        return alert(`Input Error`);
      }
      Object.setPrototypeOf(this.#editTarget, new Cycling());
      delete this.#editTarget.cadence;
      this.#editTarget.activity = `Cycling`;
      this.#editTarget.distance = distance;
      this.#editTarget.duration = duration;
      this.#editTarget.elevation = elevation;
      // this.#editTarget.date = new Date(this.#editTarget.date);
      this.#editTarget.calcSpeed();
      this.#editTarget.createWorkoutDescription();
    }

    // console.log(this.#allWorkouts);
    // console.log(this.#editTarget);

    // this.#allWorkouts.push(workout);
    this._hideEditForm();

    this._pushToLocalStorage();

    // this._renderWorkout(this.#editTarget);

    // location.reload();

    this._renderOldWorkouts();
  }

  sortWorkouts(sortBy) {
    // console.log(sortBy);

    this._renderOldWorkouts(sortBy);
  }
}

const app = new App();

class Workout {
  date = new Date();
  workoutNumber = Number(
    `${(
      (Date.now() * 8949616546165 * Math.random()) /
      (14684656 * Math.random())
    ).toFixed(0)}`.slice(-5)
  );
  analytics = { clicks: 0 };

  constructor(coordinates, distance, duration) {
    this.coordinates = coordinates;
    this.distance = distance;
    this.duration = duration;
  }
  // inputDistance.value
  // inputDuration.value

  createWorkoutDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // console.log(this);

    this.description = `${this.workoutNumber}: ${this.activity} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  addClick() {
    this.analytics.clicks = this.analytics.clicks + 1;
    // console.log(this);
  }
}

class Running extends Workout {
  activity = `Running`;

  constructor(coordinates, distance, duration, cadence) {
    super(coordinates, distance, duration);

    this.cadence = cadence;

    this.calcPace();
    this.createWorkoutDescription();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  activity = `Cycling`;

  constructor(coordinates, distance, duration, elevation) {
    super(coordinates, distance, duration);

    this.elevation = elevation;

    this.calcSpeed();
    this.createWorkoutDescription();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const test123 = new Running([49, 12], 10, 5.2, 61);

// class Test {
//   test1 = 0;

//   constructor(a, b, c, test) {
//     this.a = a;
//     this.b = b;
//     this.c = c;
//     // this.test1 = test;
//   }
// }

// const test123 = new Test(`a1`, `b1`, `c1`);
