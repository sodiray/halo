

document.addEventListener("DOMContentLoaded", function(event) {
  window.halo = new Halo();
});

/*
*   Halo
*   - Page master. Matches controllers with elements and inits page
*/
function Halo() {
  // Used during init to setup controllers given [data-view] attibute
  this.constructors = {
    'auth': AuthController,
    'store': StoreController
  };
  this.mainView = 'auth';
  this.controllers = {};
  this.initControllers();
}
Halo.prototype.initControllers = function() {
  /*
  *   Find all elements in dom with [data-view] attribute then
  *   look at the `this.constructors` map and try to find a
  *   controller that matches the view.
  */
  var controllerElems = document.querySelectorAll('[data-view]');
  if (!controllerElems || controllerElems.length == 0) return;
  for (i = 0; i < controllerElems.length; i++) {
    var elem = controllerElems[i];
    var view = elem.getAttribute('data-view');
    var controllerConstructor = this.constructors[view];
    if (!controllerConstructor) {
      console.error("Could not find controller for '" + view + "'");
      continue;
    }
    c = new controllerConstructor(elem);
    if (view == this.mainView) {
      c.show();
    } else {
      c.hide();
    }
    this.controllers[view] = c;
  }
};
Halo.prototype.segue = function(view) {
  for (var viewName in this.controllers) {
    var c = this.controllers[viewName];
    if (viewName == view) {
      c.show();
      c.didGetFocus();
    } else {
      c.hide();
      c.didLeaveFocus();
    }
  }
};


/*
*   BaseController
*/
function Controller(elem) {
  this.elem = elem;
  this._isVisible = true;
  this._defaultDisplay = elem.style.display;
}
Controller.prototype.show = function() {
  if (!this._isVisible) {
    this.elem.style.display = this._defaultDisplay;
    this._isVisible = true;
  }
};
Controller.prototype.hide = function() {
  if (this._isVisible) {
    this.elem.style.display = 'none';
    this._isVisible = false;
  }
};
Controller.prototype.didGetFocus = function() {
  // Ment for extending controller instance to override
  // and implement. Stubbing here so theres no explosions
  // if not implemented in subclass
};
Controller.prototype.didLeaveFocus = function() {
  // Ment for extending controller instance to override
  // and implement. Stubbing here so theres no explosions
  // if not implemented in subclass
};


/*
*   AuthController
*/
function AuthController(elem) {
  Controller.call(this, elem);
  this.input = Doman.Query.id('authPassword').asInput();
  this.submit = Doman.Query.id('authSubmit').asButton();
  this.error = Doman.Query.id('authError');

  this.input.enter(this.onInputEnter.bind(this));
  this.submit.click(this.onInputEnter.bind(this));

  // Try to login. HaloService will use
  // localStorage secret if it exists
  HaloService.login()
    .then(function() {
      window.halo.segue('store');
    });
}
AuthController.prototype = Object.create(Controller.prototype);
AuthController.prototype.onInputEnter = function(e) {
  var secret = this.input.elem.value;
  var cls = this;
  HaloService.login(secret)
    .then(function() {
      window.halo.segue('store');
      cls.error.addClass('hidden');
    })
    .catch(function() {
      cls.error.removeClass('hidden');
    });
};


/*
*   StoreController
*/
function StoreController(elem) {
  Controller.call(this, elem);

  this.current = Doman.Query.id('storeCurrentOutlet');
  this.valueContainer = Doman.Query.id('storeValueContainer');
  this.valueInput = Doman.Query.id('storeValueInput').asInput();
  this.breadcrumb = Doman.Query.id('storeBreadcrumb');
  this.backButton = Doman.Query.id('storeCurrentBackButton').asButton();
  this.updateButton = Doman.Query.id('storeValueUpdateButton').asButton();
  this.newKeyButton = Doman.Query.id('storeNewKeyButton').asButton();
  this.newKeyInput = Doman.Query.id('storeNewKeyInput').asInput();
  this.newKeySubmitButton = Doman.Query.id('storeNewKeySubmitButton').asButton();
  this.newKeyForm = Doman.Query.id('storeNewKeyForm');
  this.cancelNewKeyButton = Doman.Query.id('storeCancelNewKeyButton');
  this.newKeyTypeRadios = new Doman.Radio(Doman.Query.name('keyType'));

  this.newKeyForm.hide();
  this.valueContainer.invisible();

  this.backButton.click(this.onBack.bind(this));
  this.current.click(this.onCurrentSelect.bind(this));
  this.updateButton.click(this.onUpdate.bind(this));
  this.newKeyButton.click(this.onNewKeyButtonClick.bind(this));
  this.cancelNewKeyButton.click(this.onCancelNewKeyButtonClick.bind(this));
  this.newKeySubmitButton.click(this.onNewKeySubmitButtonClick.bind(this));
}
StoreController.prototype = Object.create(Controller.prototype);
StoreController.prototype.onCurrentSelect = function(e) {
  var target = e.target;
  if (target.nodeName !== "LI") return;
  var key = target.innerText;
  if (this._currentKey) {
    LocationService.backward();
  }
  LocationService.forward(key);
  this._updateUI();
};
StoreController.prototype.onNewKeyButtonClick = function(e) {
  this.newKeyButton.hide();
  this.newKeyForm.show();
};
StoreController.prototype.onNewKeySubmitButtonClick = function(e) {
  // TODO: Validate input value
  var newKeyName = this.newKeyInput.elem.value;
  var newKeyType = this.newKeyTypeRadios.value();
  var initValue = newKeyType === 'object' ? {} : '';
  HaloService.put(LocationService.getNext(newKeyName), initValue)
    .then(function() {
      this.newKeyForm.hide();
      this.newKeyButton.show();
      this.newKeyInput.clear();
      this._updateUI();
    }.bind(this));
};
StoreController.prototype.onCancelNewKeyButtonClick = function(e) {
  this.newKeyForm.hide();
  this.newKeyButton.show();
  this.newKeyInput.clear();
};
StoreController.prototype.onBack = function(e) {
  if (LocationService.isRoot()) return;
  LocationService.backward();
  if (this._currentKey) {
    // If were in a key view then we need to go
    // back twice to get to the previous object
    LocationService.backward();
  }
  this._updateUI();
};
StoreController.prototype.onUpdate = function(e) {
  var value = this.valueInput.value;
  HaloService.put(LocationService.getLocation(), value)
    .then(function() {
      // TODO: Update UI with success message
      console.log("Successfully updated key");
    });
};
StoreController.prototype.didGetFocus = function() {
  this._updateUI();
};
StoreController.prototype._updateBreadcrumb = function() {
  this.breadcrumb.elem.innerText = LocationService.isRoot() ?
    '(root)' :
    LocationService.getLocation();
};
StoreController.prototype._updateUI = function() {

  var location = LocationService.getLocation();

  HaloService.get(location)
    .then(function (value) {

      this._currentKey = null;
      this._clearValue();

      if (typeof value !== 'object') {
        this._currentKey = LocationService.getKey();
        this._renderValue(value);
        return;
      }

      this._updateBreadcrumb();

      var keys = Object.keys(value);

      this._renderCurrent(keys);

    }.bind(this));

};
StoreController.prototype._renderCurrent = function(currentKeys) {
  console.log("Rendering currentKeys");
  console.log(currentKeys);
  var liElems = "";
  currentKeys.forEach(function(key) {
    liElems += '<li data-store-key="' + key + '">' + key + '</li>';
  });
  this.current.elem.innerHTML = liElems;
};
StoreController.prototype._renderValue = function(value) {
  this.valueInput.elem.value = value;
  this.updateButton.show();
  this.valueContainer.visible();
  Doman.Query.data('store-key', this._currentKey)
    .forEach(function(li) {
      li.addClass('store-key-active');
    });
};
StoreController.prototype._clearValue = function(value) {
  this.valueInput.value = '';
  this.updateButton.hide();
  this.valueContainer.invisible();
  Doman.Query.class('store-key-active')
    .forEach(function(li) {
      li.removeClass('store-key-active');
    });
};


/*
*   HaloService
*/
function HaloService() {}
HaloService._secret = null;
HaloService.login = function(secret) {
  if (!secret) {
    HaloService._secret = localStorage.getItem('halo_secret');
  } else {
    HaloService._secret = HaloService._encodeSecret(secret);
  }
  return new Promise(function(resolve, reject) {
    HaloService.get('')
      .then(function(value) {
        localStorage.setItem('halo_secret', HaloService._secret);
        resolve(true);
      })
      .catch(function(err) {
        reject(err);
      });
    });
};
HaloService.get = function(key) {
  return HaloService._getValue(key);
};
HaloService.put = function(key, value) {
  return HaloService._setValue(key, value);
};
HaloService._encodeSecret = function(secret) {
  return btoa(secret);
};
HaloService._getValue = function(key) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/v1/kv/' + key);
    xhr.setRequestHeader('Authorization', 'Basic ' + HaloService._secret);
    xhr.onload = function() {
        if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response).value);
        }
        else {
            reject(xhr.status);
        }
    };
    xhr.send();
  });
};
HaloService._setValue = function(key, value) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', '/api/v1/kv/' + key);
    xhr.setRequestHeader('Authorization', 'Basic ' + HaloService._secret);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            resolve(value);
        }
        else {
            reject(xhr.status);
        }
    };
    xhr.send(JSON.stringify({ value: value }));
  });
};


/*
*   LocationService
*/
function LocationService() {}
LocationService._location = '';
LocationService.getLocation = function() {
  return LocationService._location;
};
LocationService.isRoot = function() {
  return LocationService._location === '';
};
LocationService.getKey = function() {
  return LocationService._location.split('.').slice(-1)[0];
};
LocationService.forward = function(key) {
  LocationService._location = LocationService.getNext(key);
};
LocationService.getNext = function(key) {
  return LocationService.isRoot() ?
    key :
    LocationService._location + '.' + key;
};
LocationService.backward = function() {
  if (LocationService._location.includes('.')) {
    var locationArray = LocationService._location.split('.');
    locationArray.pop();
    LocationService._location = locationArray.join('.');
  } else {
    LocationService._location = '';
  }
};


/*
*   DOM Manager/Helper Classes
*   > keepin it wet dawg...
*/

function Doman() {}

/*
*   Generic Elem
*/
Doman.Elem = function(elem) {
  this.elem = elem;
  this._defaultDisplay = this.elem.style.display;
};
Doman.Elem.prototype.hide = function() {
  this.elem.style.display = 'none';
};
Doman.Elem.prototype.show = function() {
  this.elem.style.display = this._defaultDisplay;
};
Doman.Elem.prototype.visible = function() {
  this.elem.style.opacity = "1.0";
};
Doman.Elem.prototype.invisible = function() {
  this.elem.style.opacity = "0.0";
};
Doman.Elem.prototype.addClass = function(className) {
  this.elem.classList.add(className);
};
Doman.Elem.prototype.removeClass = function(className) {
  this.elem.classList.remove(className);
};
Doman.Elem.prototype.click = function(cb) {
  if (this.elem.addEventListener) {
      this.elem.addEventListener('click', cb, false);
  } else if (this.elem.attachEvent) {
      this.elem.attachEvent('onclick', cb);
  }
};
Doman.Elem.prototype.asButton = function() {
  return new Doman.Button(this.elem);
};
Doman.Elem.prototype.asInput = function() {
  return new Doman.Input(this.elem);
};

/*
*   Button
*/
Doman.Button = function(elem) {
  Doman.Elem.call(this, elem);
};
Doman.Button.prototype = Object.create(Doman.Elem.prototype);

/*
*   Input
*/
Doman.Input = function(elem) {
  Doman.Elem.call(this, elem);
};
Doman.Input.prototype = Object.create(Doman.Elem.prototype);
Doman.Input.prototype.enter = function(cb) {
  if (this.elem.addEventListener) {
      this.elem.addEventListener('keyup', function(e) { if (e.keyCode === 13) { cb(e); }}, false);
  } else if (this.elem.attachEvent) {
      this.elem.attachEvent('onkeyup', function(e) { if (e.keyCode === 13) { cb(e); }});
  }
};
Doman.Input.prototype.clear = function() {
  this.elem.value = null;
};

/*
*   Radio
*/
Doman.Radio = function(elems) {
  this.elems = elems;
};
Doman.Radio.prototype.value = function() {
  for (var i = 0; i < this.elems.length; i++) {
    if (this.elems[i].elem.checked) return this.elems[i].elem.value;
  }
};

/*
*   Query
*/
Doman.Query = {};
Doman.Query._convertElementsToDomanElems = function(domElems) {
  var elems = [];
  for (var i = 0; i < domElems.length; i++) {
    elems.push(new Doman.Elem(domElems[i]));
  }
  return elems;
};
Doman.Query.class = function(_class) {
  var domElems = document.getElementsByClassName(_class);
  return Doman.Query._convertElementsToDomanElems(domElems);
};
Doman.Query.data = function(attr, value) {
  var selector = '[data-' + attr + '="' + value + '"]';
  var domElems = document.querySelectorAll(selector);
  return Doman.Query._convertElementsToDomanElems(domElems);
};
Doman.Query.id = function(id) {
  var domElem = document.getElementById(id);
  return new Doman.Elem(domElem);
};
Doman.Query.name = function(name) {
  var domElems = document.getElementsByName(name);
  return Doman.Query._convertElementsToDomanElems(domElems);
};
