/* require */
const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Student = require('./models/student');
const methodOverride = require('method-override');
const createNewObject = require('./models/utils');

/* middleware */
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
mongoose.set('useFindAndModify', false);

mongoose
  .connect('mongodb://127.0.0.1:27017/studentDb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('成功連到mongoDB');
  })
  .catch((e) => {
    console.log('資料庫連線失敗');
    console.log(e);
  });

/* Transform the Student Project into a RESTful API. */

/* Get all Data */
app.get('/students', async (req, res) => {
  try {
    let data = await Student.find();
    res.send(data);
  } catch {
    res.send({ message: 'Error with finding data.' });
  }
});

app.get('/students/insert', (req, res) => {
  res.render('studentInsert.ejs');
});

/* Get Data by ID */
app.get('/students/:id', async (req, res) => {
  let { id } = req.params;
  // Find student data that matches this ID in MongoDB.
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.send(data);
    } else {
      res.status(404);
      res.send({ message: 'Cannot find data.' });
    }
  } catch (err) {
    res.send('Error!!!');
    console.log(err);
  }
});

/* Create a new student via POST request. */
app.post('/students/', (req, res) => {
  // Extract the data we need from req.body.
  let { id, name, age, merit, other } = req.body;

  // Set the properties of a new Student
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });

  // Save the new student data into MongoDB.
  newStudent
    .save()
    .then(() => {
      res.send({ message: 'Successfully post a new student' });
    })
    .catch((err) => {
      res.status(404);
      res.send(err);
    });
});

// PUT request
app.put('/students/:id', async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.send('Successfully updated the data.');
  } catch (err) {
    res.status(404);
    res.send(err);
  }
});

/* Patch Request to API */
// class newData {
//   constructor() {}
//   // method
//   setProperty(key, value) {
//     if (key !== 'merit' && key !== 'other') {
//       this[key] = value;
//     } else {
//       this[`scholarship.${key}`] = value;
//     }
//   }
// }

app.patch('/students/:id', async (req, res) => {
  let { id } = req.params;
  
  let newObject = createNewObject(req.body);
  // let newObject = new newData();
  // for (let property in req.body) {
  //   newObject.setProperty(property, req.body[property]);
  // }

  console.log(newObject);
  try {
    let d = await Student.findOneAndUpdate({ id }, newObject, {
      new: true,
      runValidators: true,
    });
    console.log(d); // findOneAndUpdate() returns a query
    res.send('Successfully updated the data.');
  } catch (err) {
    res.status(404);
    res.send(err);
  }
});

// use Postman to send DELETE request
/* Delete Data by ID */
app.delete('/students/delete/:id', (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((message) => {
      console.log(message);
      res.send('Deleted successfully.');
    })
    .catch((err) => {
      console.log(err);
      res.send('Delete failed.');
    });
});

/* Delete All Data */
app.delete('/students/delete', (req, res) => {
  Student.deleteMany({})
    .then((message) => {
      console.log(message);
      res.send('Deleted all data successfully.');
    })
    .catch((err) => {
      console.log(err);
      res.send('Delete failed.');
    });
});

app.get('/*', (req, res) => {
  res.status(404);
  res.send('Not allowed.');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000. ');
});
