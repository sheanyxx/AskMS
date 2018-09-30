var config = {
  apiKey: '@-@',
  authDomain: '@-@',
  databaseURL: 'https://askms2-218010.firebaseio.com',
  projectId: 'askms2-218010',
  storageBucket: 'askms2-218010.appspot.com',
  messagingSenderId: '....'
};
firebase.initializeApp(config);

// Reference messages collection

// Listen for form submit
document.getElementById('contactForm').addEventListener('submit', submitForm);

document.getElementById('selectForm').addEventListener('submit', selectForm);

function selectForm(e) {
  e.preventDefault();
  var e = document.getElementById('courses');
  var selected = e.options[e.selectedIndex].value;
  // console.log('selected: ' + selected);
  var info = 'Selected Subject: ' + selected + '<br>';
  document.getElementById('selectForm').reset();

  var firebaseHeadingRef = firebase.database().ref(selected + '/Number');
  firebaseHeadingRef.on('value', function(datasnapshot) {
    // console.log(datasnapshot.val());
    info += datasnapshot.val().toString();
  });

  console.log(info);
  var expinfo = document.getElementById('expertinfo');
  expinfo.innerHTML = info;
}

// Submit form
function submitForm(e) {
  e.preventDefault();
  // Get values

  var name = getInputVal('name');

  // var email = getInputVal('email');
  var phone = getInputVal('phone');
  if (name.length === 0 || phone.length !== 10) {
    document.querySelector('.alertsubmit').style.display = 'block';
    setTimeout(function() {
      document.querySelector('.alertsubmit').style.display = 'none';
    }, 3000);
    return;
  }

  document.querySelector('.goodsubmit').style.display = 'block';
  setTimeout(function() {
    document.querySelector('.goodsubmit').style.display = 'none';
  }, 3000);

  var e = document.getElementById('subjects');
  //console.log("e:"+e.options[e.selectedIndex].value)
  var select = e.options[e.selectedIndex].value;

  // Save message
  saveTutor(name, phone, select);

  // Clear form
  document.getElementById('contactForm').reset();
}

// var e1 = document.getElementById("courses");
// var selected = e1.options[e1.selectedIndex].value;
// console.log(selected)

// Function to get get form values
function getInputVal(id) {
  return document.getElementById(id).value;
}

document.getElementById("courses").addEventListener("change", changeNumber);

function changeNumber() {
    var e = document.getElementById("courses");
    var phone = e.options[e.selectedIndex].value;
    var text = "Text your question to " + phone;
    var option = document.getElementById('numberToCall');
    option.innerText = text;
}

// Save message to firebase
function saveTutor(name, phone) {
  // console.log('select');
  // console.log(select);
  var e = document.getElementById('subjects');
  var subject = e.options[e.selectedIndex].text;
  var newTutorRef = firebase
    .database()
    .ref(subject + '/Experts/' + phone + '/name');
  newTutorRef.set(name);
}

var rootRef = firebase.database().ref();

rootRef.on('value', function(datasnapshot) {
  var obj = datasnapshot.val();
  var subjectArr = Object.keys(obj);
  var str = '';
  var option = document.getElementById('courses');
  var subject = document.getElementById('subjects');
  subjectArr.forEach(function(element) {
    //console.log("element"+element)
    str += '<option value="' + obj[element]['Number'] + '" name="'+element + '">' + element + '</option>';
    // console.console.log(str);
  });
  option.innerHTML = str;
  subject.innerHTML = str;
  changeNumber();
});
