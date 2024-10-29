// get current time and day
let date = new Date();
let day = date.getDate();
let currentMonth = date.toLocaleString('default', { month: 'long' });
let time = `${date.getHours()}:${date.getMinutes()}`;

//get the letter day and if it is a half day
let currentDay;
let isHalfDay;
$.ajax({
     type: "GET",
     url: "https://api.npoint.io/9294296d96328477aa64",
     success: function (data) {
          currentDay = data[currentMonth][day - 1].letter;
          isHalfDay = data[currentMonth][day - 1].halfDay;
          $('#formGroup').text(currentDay);
     }
});

function getClassesForDay(data, day) {
     return data.schedule.filter(classInfo => classInfo.days.includes(day))
}

//setting the data using local storage cuz why not?
let loadedData = localStorage.getItem('scheduleTable');
$('#scheduleList').html(loadedData);

function convertTime(time) {
     //check if it is AM/PM and store that value within a variable
     let meridiem = time.split(' ')[1];
     let newTime = time.replace(meridiem, '').trim().split(':'); //isolate the numbers into hours and minutes
     let hour = parseInt(newTime[0]); //set the hours based on the split

     if (meridiem === 'PM' && hour != 12) {
          hour += 12; //modify the hours based on the meridiem and change to european time
     }

     let minutes = parseInt(newTime[1]) + hour * 60; //calculate how many minutes has passed in the day
     return minutes;
}

function isCurrentClass(startTime, endTime) {
     let start = convertTime(startTime);
     let end = convertTime(endTime);
     let currentTime = convertTime(time);
     console.log(start, currentTime, end);
     //check if the amount of minutes passed is more than the start time but less than the end time
     return (start <= currentTime && currentTime <= end);
}

$('#submitDay').on('click', () => {
     //clear all schedule data
     $('#scheduleList').empty();

     //check if the schedule list is empty to prevent duplicates being added
     $.ajax({
          type: "GET",
          url: "https://api.npoint.io/07f64e16e4f3361bde3e",
          success: function (data) {
               //get the list of classes for that day using filter
               const classesForToday = getClassesForDay(data, currentDay);
               //create the order of the periods based on the letter day for organization and double lab
               const periodMap = {
                    'A': [1, 1, 3, 5, 6],
                    'B': [4, 1, 2, 7, 5],
                    'C': [3, 4, 1, 6, 7],
                    'D': [2, 3, 4, 5, 6],
                    'E': [1, 2, 3, 7, 5],
                    'F': [4, 1, 2, 6, 7],
                    'G': [3, 4, 7, 5, 6],

               }
               //get the correct order for periods based on the current day's letter
               const periods = periodMap[currentDay];
               //create a new array which maps the correct class to the period based on the order of the periods
               const newArray = periods.map(block => classesForToday.find(obj => obj.period === block));
               //create the time for the bell schedule and inclue lunch times.
               let bellSchedule;

               if (isHalfDay) {
                    bellSchedule = {
                         1: { start: '8:24 AM', end: '9:14 AM' },
                         2: { start: '9:19 AM', end: '10:09 AM' },
                         3: { start: '10:14 AM', end: '11:04 AM' },
                         4: { start: '11:09 AM', end: '11:59 AM' },
                         5: { start: '12:04 PM', end: '12:54 PM' }
                    }
               } else {
                    bellSchedule = {
                         1: { start: '8:24 AM', end: '9:31 AM' },
                         2: { start: '9:36 AM', end: '10:43 AM' },
                         3: { start: '10:48 AM', end: '11:55 AM' },
                         lunch: { start: '12:00 PM', end: '12:35 PM' },
                         4: { start: '12:41 PM', end: '1:48 PM' },
                         5: { start: '1:53 PM', end: '3:00 PM' }
                    }
               }
               newArray.forEach((item, index) => {
                    item.time = bellSchedule[index + 1]; //set the correct time for that class based on the periods of the class, making sure the period and time for that period correspond
                    //append the rows based on the current index
                    $('#scheduleList').append(
                         `<tr>
                                   <td>${index + 1}</td>
                                   <td>${item.time.start} - ${item.time.end}</td>
                                   <td>${item.class}</td>
                                   <td>${item.teacher}</td>
                                   <td>${item.room}</td>
                              </tr>`
                    )
                    //check if the current time is within a class' timeframe and change the bg color if true
                    if (isCurrentClass(item.time.start, item.time.end)) {
                         $($('#scheduleList').children()[index]).css({
                              backgroundColor: 'yellow',
                         })
                    }
                    //create the lunch item after the 3rd row was created but before the 4th row is 
                    if (index === 2 && !isHalfDay) {
                         $('#scheduleList').append(
                              `<tr>
                                        <td>LUNCH</td>
                                        <td>${bellSchedule.lunch.start} - ${bellSchedule.lunch.end}</td>
                                        <td>
                                             LUNCH
                                        </td>
                                        <td>N/A</td>
                                        <td>N/A</td>
                                   </tr>`
                         )
                    }
               })

               let scheduleData = $('#scheduleList').html();
               localStorage.setItem('scheduleTable', scheduleData);
          }
     });
})
