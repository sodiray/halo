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

    let key = req.params.key || '';
    key = key == '' ? 'halo' : 'halo.' + key;
    let value = this.store.get(key);

    if (value == null) {
      res.status(400);
      res.send({
        code: 4000,
        message: "Could not find value for given key",
        key: key
      });
    }

    res.send({
      code: 2000,
      message: "Successfully retrieved value",
      key: key,
      value: value
    });

  }

  setValue(req, res) {

    let key = req.params.key || '';
    key = key == '' ? 'halo' : 'halo.' + key;
    let value = req.body;

    this.store.put(key, value);

    res.send({
      code: 2000,
      message: "Successfully stored value"
    });

  }


}


module.exports = Halo;
