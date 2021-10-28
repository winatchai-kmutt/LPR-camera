const express = require('express');
const router = express.Router();

const multer = require('multer');

// เก็บไฟล์ 
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  });


//posts Model
const Posts = require('../../model/Posts');


// @routes POST api/posts
// @desc Create An post
router.post('/', upload.array('Image', 2),  (req, res, next)=>{ 
    console.log(req.files)
    car = req.files
    console.log(car[0].path,car[1].path)
    const newPost = new Posts({ 
        regis: req.body.regis,
        detail: req.body.detail,
        timeIn: req.body.timeIn,
        timeOut: req.body.timeOut,
        status: req.body.status,
        carImage: car[0].path,    // ดูได้ที่รูปแบบไฟล์ภาพ ที่ console.log(req.file)
        plateNumber: car[1].path

    });
    newPost.save() 
    .then(result => {
        res.status(201).json({
            message: 'Addiding CarCheck succesfully',
            createdRegis: {
                _id: result._id,
                regis: result.regis,
                detail: result.detail,
                timeIn: result.timeIn,
                timeOut: result.timeOut,
                status: result.status,
                carImage: `https://beta-api-car-check.herokuapp.com/${result.carImage}` ,
                plateNumber: `https://beta-api-car-check.herokuapp.com/${result.plateNumber}`,
                request: {
                    type: 'POST',
                    url: `https://beta-api-car-check.herokuapp.com/api/posts/${result._id}`
                }
            }
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({
            erroe: err
        })
    })
    
});

// @routes GET api/posts
// @desc Create All post
router.get('/', (req, res, next)=>{
    Posts.find() 
    .select('_id regis detail timeIn timeOut status carImage plateNumber') 
    .exec()
    .then(docs =>{     
        const respose = {
            count: docs.length,
            carDoc: docs.map(doc=> {
                return {
                    _id: doc._id,
                    regis: doc.regis,
                    detail: doc.detail,
                    timeIn: doc.timeIn,
                    timeOut: doc.timeOut,
                    status: doc.status,
                    carImage: `https://beta-api-car-check.herokuapp.com/${doc.carImage}`,
                    plateNumber: `https://beta-api-car-check.herokuapp.com/${doc.plateNumber}`,
                    request: {
                        type: 'GET',
                        url: `https://beta-api-car-check.herokuapp.com/api/posts/${doc._id}`
                    }
                }
            })
        }
        //if (docs.length >=0){
            res.status(200).json(respose);
        //}
        //else{
        //    res.status(404).json({
        //        message: 'No entries found'
        //    })
        //}
        
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    });
});


// @routes GET api/posts/:id
// @desc GET An post
router.get('/:idCar', (req, res, next)=>{
    const id = req.params.idCar;  // params get id
    Posts.findById(id)
    .select('regis detail timeIn timeOut status carImage')
    .exec() 
    .then(doc => {
        console.log("From database", doc)
        if (doc){
            res.status(200).json({
                product: doc,
                request: {
                    type: 'POST',
                    description: 'Get_all_carImage',
                    url: `https://beta-api-car-check.herokuapp.com/api/posts`
                }
            });
        }
        else{
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
        
    })
    .catch(err=> {
        console.log(err)
        res.status(200).json(err);
    });
});
/* [
	{
	"propName": "name",
	"value": "Jecllllll"
}
] */


// @routes DELETE api/posts/:id
// @desc delete An post
router.delete('/:idCar', (req, res, next)=>{
    const id = req.params.idCar
    Posts.remove({_id: id})
    .exec()
    .then(result =>{
        res.status(200).json({
            message: 'Car-Check deleted',
            request:{
                type: 'POST',
                url: `https://beta-api-car-check.herokuapp.com/api/posts`, 
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


// @routes UPDATE api/posts/:id
// @desc update An post
router.patch('/:idCar', (req, res, next)=>{
    const id = req.params.idCar;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Posts.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json({
                message: 'Car-Check updated',
                request: {
                    type: 'GET',
                    url: `https://beta-api-car-check.herokuapp.com/api/posts/${id}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;