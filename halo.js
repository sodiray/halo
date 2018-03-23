/*
*
*   Halo Controller - handlers for halo api endpoints
*
*/

class Halo {

  constructor(store) {
    this.store = store;
  }

  getValue(req, res) {

    let key = req.params.key;
    let value = this.store.get(key);

    res.send({ code: 2000, message: "success", key: key, value: value });
    
  }

  setValue(req, res) {

    let key = req.params.key;
    let value = req.body;

    this.store.put(key, value);

    res.send({ code: 2000, message: "success" });

  }


}


module.exports = Halo;
