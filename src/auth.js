

let secret = process.env.HALO_AUTH_SECRET;

module.exports = function(req, res, next) {
  if (secret) {
    let header = req.get('Authorization');
    if (!header || header.replace('Basic ', '') !== Buffer.from(secret).toString('base64')) {
      res.status(401).send({ code: 4001, message: "Invalid authentication" });
      return;
    }
  }
  next();
};
