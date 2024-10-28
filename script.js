// get current time and day
let date = new Date();
let day = date.getDate();
let currentMonth = date.toLocaleString('default', { month: 'long' });
//get the letter day and if it is a half day
let currentDay;
$.ajax({
     type: "GET",
     url: "https://api.npoint.io/9294296d96328477aa64",
     success: function (data) {
          currentDay = data[currentMonth][day - 1].letter;
          $('#formGroup').text(currentDay)
     }
});

function getClassesForDay(data, day) {
     return data.schedule.filter(classInfo => classInfo.days.includes(day))
}

$.ajax({
     type: "GET",
     url: "https://api.npoint.io/07f64e16e4f3361bde3e",
     success: function (data) {
          console.log(getClassesForDay(data, currentDay));
     }
});