import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import loginModel from '../models/loginModel.js';
import hindalcoModel from '../models/hindalcoModel.js';


// http://localhost:4000/backend/hindalcoSignup?Username=[username]&Password=[password]
export const signup = (req, res) => {
    const {Username, Password} = req.query;
    bcrypt.hash(Password, 10)
    .then(hash => {
        loginModel.create({Username, Password: hash})
        .then(info => res.json(info))
        .catch(err => res.json(err))
    })
    .catch(error => console.log(error));
};

export const login = (req, res) => {
  const { Username, Password } = req.body;
  loginModel
    .findOne({ Username })
    .then((user) => {
      if (user) {
        bcrypt.compare(Password, user.Password, (err, response) => {
          if (response) {
            const redirectUrl = "/";
            const token = jwt.sign(
              { Username: user.Username },
              "jwt-secret-key-123",
              { expiresIn: "1d" }
            );
            res.json({ token, redirectUrl });
          } else {
            res.json("Incorrect password");
          }
        });
      } else {
        res.json("User not found");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

// token validation
export const validateToken = (req,res) => {
  const token = req.headers["authorization"];  
//   if (!token) {
//     return res.status(401).json({ valid: false });
//   }

  jwt.verify(token, "jwt-secret-key-123", (err, user) => {
    if (err) {
      return res.status(403).json({ valid: false });
    }
    else {
        res.json({ valid: true });
    }
  });

//   if (!token) {
//     return res.json({ valid: false });
//   }
};

// insert link
// http://localhost:4000/backend/insertHindalcoData?s1=[insertData]&s2=[insertData]&s3=[insertData]&s4=[insertData]&s5=[insertData]&s6=[insertData]&s7=[insertData]&s8=[insertData]&s9=[insertData]&s10=[insertData]&s11=[insertData]&s12=[insertData]

export const insertHindalcoData = async (req,res) => {
  const {s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12} = req.query;

  if ( !s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7 || !s8 || !s9 || !s10 || !s11 || !s12  ) {
    return res.status(400).json({ error: 'Missing required parameters'});
  }

  try {
    const hindalcoData = {
      S1: s1, 
      S2: s2,
      S3: s3,
      S4: s4,
      S5: s5,
      S6: s6,
      S7: s7,
      S8: s8,
      S9: s9,
      S10: s10,
      S11: s11,
      S12: s12,
    };
    await hindalcoModel.create(hindalcoData);
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message })
  };
};

export const getHindalcoData = async (req,res) => {
  try {
    const limit = parseInt(req.query.limit);

    const hindalcoData = await hindalcoModel
    .find({})
    .sort({ _id: -1 })
    .limit(limit)
    .select({__v: 0, updatedAt: 0});

    if (hindalcoData.length > 0) {
      res.json({ success: true, data: hindalcoData });
    } else {
      res.json({ success: false, message: "Utmaps Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

// date wise hindalco data for line graph
export const getHindalcoDatewiseData = async (req,res) => {
  try {
    const {selectedGauge, datepickerSensorFromDate, datepickerSensorToDate} = req.body;

    const newToDate = new Date(datepickerSensorToDate);
    newToDate.setDate(newToDate.getDate() + 1);

    const datewiseData = await hindalcoModel.find(
      {
        createdAt: {
          $gte: new Date(datepickerSensorFromDate),
          $lte: newToDate,
        },
      },
      {
        [selectedGauge]: 1,
        createdAt: 1
      }
    );

    if(datewiseData.length > 0) {
      res.json({ success: true, data: datewiseData });
    } else {
      res.json({success: false, message: 'No data found in that time period'})
    }
  } catch (error) {
    console.error(' Error fetching data', error);
  };
};

// report api
export const getHindalcoReportData = async(req,res) => {
  try {
    const {
      fromDate,
      toDate,
      count,
      unselectedSensors,
      sensorWiseFromDate,
      sensorWiseToDate,
      sensorWiseCount,
    } = req.query;

    let query = {};
    let sort = { _id: -1 };
    const unselectedSensorsArray = unselectedSensors
      ? unselectedSensors.split(",")
      : [];

    if (fromDate || toDate) {
      const newToDate = new Date(toDate);
      newToDate.setDate(newToDate.getDate() + 1);

      query = {
        createdAt: { $gte: new Date(fromDate), $lte: newToDate },
      };
    }

    if (sensorWiseFromDate || sensorWiseToDate) {
      const newSensorWiseToDate = new Date(sensorWiseToDate);
      newSensorWiseToDate.setDate(newSensorWiseToDate.getDate() + 1);

      query = {
        createdAt: {
          $gte: new Date(sensorWiseFromDate),
          $lte: newSensorWiseToDate,
        },
      };
    }

    let projection = { __v: 0, updatedAt: 0, _id: 0 };

    if (unselectedSensorsArray.length > 0) {
      unselectedSensorsArray.forEach((sensor) => {
        projection[sensor] = 0;
      });
    }

    let cursor = hindalcoModel.find(query).sort(sort).select(projection);

    if (count) {
      cursor = cursor.limit(parseInt(count));
    }

    if (sensorWiseCount) {
      cursor = cursor.limit(parseInt(sensorWiseCount));
    }
    
    const hindalcoReportData = await cursor.exec();
    res.json({ success: true, data: hindalcoReportData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
}