const express = require("express");
const {
  subjectCreate,
  allSubjects,
  classSubjects,
  freeSubjectList,
} = require("../controllers/subjectController");
const router = express.Router();

router.post("/add", subjectCreate);
router.get("/get", allSubjects);
router.get("/classSubjects/:id", classSubjects);
router.get("/freeSubjects/:id", freeSubjectList);
//add like this
//you can add multiple subjects at once 
// {
//   //   "schoolId": "660d8dc47c38601f49dcfcaf",
//     "className": "660d8fa0e7df2406e11c4888",
//     "subjects": [
//       {
//         "subName": "HINDI",
//         "subCode": "HN01"
//       },
//       {
//         "subName": "GEOGRAPHY",
//         "subCode": "GEO01"
//       }
//     ]
//   }
  
module.exports = router; 
