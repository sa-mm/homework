var FormView = function () {
  var age,
    rel,
    smoker,
    addBtn,
    submitBtn,
    form,
    buttons,
    debug,
    household;

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
  debug = document.getElementsByClassName('debug')[0];
  household = document.getElementsByClassName('household')[0];

  return {
    age: age,
    rel: rel,
    smoker: smoker,
    addBtn: addBtn,
    buttons: buttons,
    submitBtn: submitBtn,
    debug: debug,
    household: household
  }
}

var FormModel = function () {
  var members = [];

  function getMembers() {
    return members;
  }

  function addMember(member) {
    members.push(member);
  }

  function removeMember(member) {
    members = members.filter(function (e) {
      return !isEqual(member, e);
    });
  }

  function isEqual(obj1, obj2) {
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

  return {
    getMembers: getMembers,
    addMember: addMember,
    removeMember: removeMember
  }
}

var FormController = function (pModel) {
  var model,
    view,
    member;

  model = new FormModel();
  view = new FormView();

  function addAndUpdate(event) {
    var validatedMember;

    event.preventDefault();
    // build member from form
    member = {
      age: view.age.value,
      rel: view.rel.value,
      smoker: view.smoker.checked
    }

    //clear warnings
    clearErrors();

    //validate member
    validatedMember = validateMember(member);
    if (validatedMember.hasError) {
      return false;
    }

    //insert member into model
    model.addMember(member);

    // update view based on model
    createList();
    resetForm();
  }

  function createSubmission(event) {
    var members,
      debug,
      household,
      confirmation,
      buttons,
      editBtn;

    event.preventDefault();
    // check that there are members to submit
    members = model.getMembers();
    clearErrors();
    if (members.length === 0) {
      displayError(view.submitBtn, 'Please add one member to the household before submitting.');
      return false;
    }

    // submit members
    debug = view.debug;
    debug.textContent = JSON.stringify(members, null, '\t');
    debug.style.display = 'block';

    //disable buttons
    household = view.household;
    confirmation = makeBuilderElement('P', "Submitted.");
    household.insertAdjacentElement('afterend', confirmation);
    buttons = view.buttons;
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.disabled = true;
    }
    editBtn = makeBuilderElement('BUTTON', 'edit submission');
    household.insertAdjacentElement('afterend', editBtn);
    editBtn.addEventListener('click', editSubmission, false);
  }

  function removeAndUpdate(event) {
    var member,
      re;

    event.preventDefault();
    // get data from associated html list
    member = makeMember(event.target.parentNode.firstElementChild);

    //remove item from model.
    model.removeMember(member);

    //update html list
    createList();
    document.removeEventListener('click', removeAndUpdate);
  }

  function editSubmission(event) {
    var debug,
      members,
      buttons;

    event.preventDefault();

    // update html list
    createList();

    // reset debug
    debug = view.debug;
    debug.textContent = '';
    debug.style.display = 'none';

    //remove edit submission button and confirmation
    event.target.parentNode.removeChild(event.target.nextElementSibling);
    event.target.parentNode.removeChild(event.target);

    // enable buttons that were disabled upon submission
    buttons = view.buttons;
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.disabled = false;
    }
    document.removeEventListener('click', editSubmission);
  }

  function displayError(element, msg) {
    var error,
      div;

    error = makeBuilderElement('P', msg);
    error.style.color = 'red';
    error.className = 'error';
    div = element.parentNode;
    div.appendChild(error);
  }

  function clearErrors() {
    var errors = document.getElementsByClassName('error');
    while (errors.length > 0) {
      var error = errors[0];
      error.parentNode.removeChild(error);
    }
  }

  function validateMember(member) {
    var hasError,
      rels;

    hasError = false;
    if (!+member.age > 0 || member.age === '') {
      displayError(view.age, 'Please enter an age greater than 0.');
      hasError = true;
    }
    if (member.rel === '') {
      displayError(view.rel, 'Please select a relationship.')
      hasError = true;
    }
    // check if "self" has already been entered
    if (member.rel === 'self') {
      rels = model.getMembers().map(function (e) {
        return e.rel;
      });
      if (rels.includes(member.rel)) {
        displayError(view.rel, 'Please only enter yourself once.');
        hasError = true;
      }
    }

    if (hasError) {
      member.hasError = true;
    }
    return member;
  }

  function createList() {
    var members,
      household;

    members = model.getMembers();
    household = view.household;
    while (household.firstChild) {
      household.removeChild(household.firstChild);
    }
    for (var i = 0; i < members.length; i++) {
      var member,
        re,
        memberText,
        pre,
        li,
        removeBtn;

      member = members[i];
      re = /[{}"]/g;
      memberText = JSON.stringify(member, null, '\t').replace(re, '');
      pre = makeBuilderElement('PRE', memberText);
      li = makeBuilderElement('LI', '');
      removeBtn = makeBuilderElement('BUTTON', 'remove');
      li.appendChild(pre);
      li.appendChild(removeBtn);
      household.appendChild(li);

      removeBtn.addEventListener('click', removeAndUpdate, false);
    }
  }

  function createMemberText(member) {
    var age,
      rel,
      smoker,
      text;

    age = member.age;
    rel = member.rel;
    smoker = member.smoker;
    text = 'Age: ' + age + ',\n' + 'Relationship: ' + rel + ', ' + 'Smoker: ' + smoker;
    return text;
  }

  function makeMember(item) {
    var member,
      re;

    member = "{" + item.textContent.trim() + "}";
    re = /\w+/g;
    member = member.replace(re, function (word) {
      if (word === 'false' || word === 'true') {
        return word;
      }
      return '"' + word + '"';
    });
    member = JSON.parse(member);
    return member;
  }

  function makeBuilderElement(el, text) {
    var el,
      textNode;

    el = document.createElement(el);
    textNode = document.createTextNode(text);
    el.appendChild(textNode);
    return el;
  }

  function resetForm() {
    view.age.value = '';
    view.rel.value = '';
    view.smoker.checked = false;
  }

  view.addBtn.addEventListener('click', addAndUpdate, false);
  view.submitBtn.addEventListener('click', createSubmission, false);
}

new FormController();

