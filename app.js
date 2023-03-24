/* require */
const express = require('express');
const app = express();
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Student = require('./models/student');
const methodOverride = require('method-override');

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

// Transform the Student Project into a RESTful API.
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

// 學生個人頁面
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

app.post('/students/insert', (req, res) => {
  // 把我們要的資訊從req.body裡面提領出來
  let { id, name, age, merit, other } = req.body;

  // 設定newStudent的屬性
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });

  // 將新學生物件存入DB
  newStudent
    .save()
    .then(() => {
      console.log('Student accepted. 已儲存此學生');
      res.render('accept.ejs');
    })
    .catch((err) => {
      console.log('Student not accepted. 此學生未被儲存');
      console.log(err);
      res.render('reject.ejs');
    });
});

app.get('/students/edit/:id', async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render('edit.ejs', { data });
    } else {
      res.send('Cannot find student.');
    }
  } catch {
    res.send('Error!');
  }
});

// PUT request
app.put('/students/edit/:id', async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render('reject.ejs');
  }
});

// use Postman to send DELETE request
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

app.get('/*', (req, res) => {
  res.status(404);
  res.send('Not allowed.');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000. ');
});
