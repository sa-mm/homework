var age,
  rel,
  smoker,
  addBtn,
  submitBtn,
  form,
  buttons,
  householdList;

form = document.forms[0];
age = form.elements.age;
rel = form.elements.rel;
smoker = form.elements.smoker;
addBtn = document.getElementsByClassName('add')[0];
//attempting to get the submit button via a unique attribute
buttons = document.getElementsByTagName('button');
for (var i = 0; i < buttons.length; i++) {
  if (buttons[i].textContent.toLowerCase() === 'submit') {
    submitBtn = buttons[i];
  }
}
householdList = []; //where we store the members added to the household


addBtn.addEventListener('click', addMember, false);
submitBtn.addEventListener('click', submitHousehold, false);

// addBtn event listener callback
function addMember(event) {
  var member,
    data,
    errors;

  event.preventDefault();

  member = {
    'age': age.value, //string
    'rel': rel.value, //string
    'smoker': smoker.checked //boolean
  };

  /// data = { 'isValid': false, 'errors': [{'type': 'age', 'msg': "Error…" }]}
  clearErrors();
  data = validateData(member);
  if (data.isValid) {
    addToHousehold(member);
    createHTMLList();
    resetForm();
  } else {
    errors = data.errors;
    errors.forEach(function (error) {
      displayErrorMessage(error.element, error.msg);
    });
  }
};

// This allows for rather open relationships:
// Multiple spouses, children older than parents, etc.
var validateData = function (member) {
  var result,
    ageError,
    relError;

  result = {};
  result.isValid = true;
  result.errors = [];

  // age is required and must be greater than 0
  if (!+member.age > 0 || member.age === '') {
    result.isValid = false;
    result.errors.push({
      'element': age,
      'msg': 'Please enter an age greater than 0.'
    });
  }

  // relationship is required
  if (member.rel === '') {
    result.isValid = false;
    result.errors.push({
      'element': rel,
      'msg': 'Please select a relationship.'
    });
  }

  // Cannot enter two people with relationship "self"
  if (member.rel === 'self' && checkSelfRel(member.rel)) {
    result.isValid = false;
    result.errors.push({
      'element': rel,
      'msg': 'Please enter yourself only once.'
    });
  }
  return result;
}

// just a quick function to help with validation 
var checkSelfRel = function (rel) {
  var self;

  self = householdList.filter(function (member) {
    return member.rel === rel;
  });

  if (self.length > 0) {
    return true; //There can't be two selves.
  }
  return false;
}



//display an error message near the relevant element
var displayErrorMessage = function (element, msgText) {
  var elementError,
    msg;

  elementError = document.createElement('p');
  msg = document.createTextNode(msgText);
  elementError.appendChild(msg);
  elementError.className = 'formError';
  elementError.style.color = 'red';
  div = element.parentNode;
  div.appendChild(elementError);
}

// clear any formError errors
var clearErrors = function () {
  var errors;

  errors = document.getElementsByClassName('formError');
  while (errors.length > 0) {
    var child;

    child = errors[0];
    child.parentNode.removeChild(child);
  }
}

var addToHousehold = function (member) {
  householdList.push(member);
}

// creates the list of members
var createHTMLList = function () {
  var householdEl;

  //just rebuild the HTML list from scratch every time.
  householdEl = document.getElementsByClassName('household')[0];
  clearElement(householdEl);

  //add every item in the householdList array to the
  //household ol element as a child;
  for (var i = 0; i < householdList.length; i++) {
    var member,
      li,
      memberText,
      removeBtn;

    member = householdList[i];
    li = document.createElement("LI");
    memberText = document.createTextNode(JSON.stringify(member));
    removeBtn = createBtn("remove");
    li.appendChild(memberText);
    li.insertAdjacentElement('beforeend', removeBtn);
    householdEl.appendChild(li);
    removeBtn.addEventListener('click', removeItem, false);
  }
}

//resets form to default values
var resetForm = function () {
  age.value = "";
  rel.value = "";
  smoker.checked = false;
}

//creates remove/edit buttons as necessary
var createBtn = function (textStr) {
  var button,
    text;

  button = document.createElement("BUTTON");
  text = document.createTextNode(textStr);
  button.appendChild(text);
  button.className = textStr.split(' ')[0];
  return button;
}

// remove item from html list
var removeItem = function () {
  var li;

  li = event.target.parentNode;
  li.parentNode.removeChild(li);
  removeFromHousehold(JSON.parse(li.firstChild.data));
  event.target.removeEventListener('click', removeItem, false);
}

// remove item from householdList array
var removeFromHousehold = function (member) {
  householdList = householdList.filter(function (item) {
    return !isEqual(member, item);
  });
}

// checks that two objects are equivalent (shallow)
var isEqual = function (obj1, obj2) {
  var obj1Props,
    obj2Props;

  obj1Props = Object.getOwnPropertyNames(obj1);
  obj2Props = Object.getOwnPropertyNames(obj2);

  if (obj1Props.length !== obj2Props.length) {
    return false;
  }

  for (var i = 0; i < obj1Props.length; i++) {
    var propName;

    propName = obj1Props[i];
    if (obj1[propName] !== obj2[propName]) {
      return false;
    }
  }

  return true;
}

//submit event listener callback
function submitHousehold(event) {
  var debug,
    householdText,
    editBtn,
    householdEl;

  event.preventDefault();
  debug = document.getElementsByClassName('debug')[0];
  editBtn = createBtn("edit submission");
  householdText = document.createTextNode(JSON.stringify(householdList, null, '\t'));
  householdEl = document.getElementsByClassName('household')[0];

  clearErrors();
  if (householdList.length === 0) {
    displayErrorMessage(event.target, "Please add at least one member to your household.");
    return;
  }

  if (debug.previousSibling.textContent === 'edit submission') {
    clearElement(debug);
    clearElement(debug.previousSibling);
  }

  debug.appendChild(householdText);
  debug.insertAdjacentElement('beforebegin', editBtn);
  debug.style.display = 'block';
  clearElement(householdEl);
  householdList = [];
  editBtn.addEventListener('click', editSubmission, false);
}

function editSubmission(event) {
  var debug,
    previousSubmission;

  debug = document.getElementsByClassName('debug')[0];
  previousSubmission = debug.textContent;

  event.preventDefault();

  householdList = JSON.parse(previousSubmission);
  createHTMLList();
  clearElement(debug);
  clearElement(debug.previousSibling);
  debug.style.display = 'none';
  event.target.removeEventListener('click', editSubmission, false);
}

var clearElement = function (el) {
  if (el.tagName === 'BUTTON') {
    el.parentNode.removeChild(el);
  } else {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }
}

