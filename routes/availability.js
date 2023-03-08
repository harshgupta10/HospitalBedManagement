const express = require('express');
const router = express.Router();



router.get('/availability', (req, res) => {
    res.status(200).render('availability', {pageTitle: "Availability" });
});

module.exports = router;
