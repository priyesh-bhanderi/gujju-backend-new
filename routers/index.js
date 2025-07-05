const exprees = require('express');
const router = exprees.Router();


router.get('/', (req, res) => {
    res.send("Gujju Backend");
});


module.exports = router;