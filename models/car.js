module.exports = function (opts) {
  var carSchema = opts.mongoose.Schema({
    cylinders: { type: Number, select: true },
    displ: { type: Number, select: true },
    drive: { type: String, select: true },
    engId: { type: Number, select: true },
    eng_dscr: { type: String, select: true },
    fuelType: { type: String, select: true },
    fuelType1: { type: String, select: true },
    id: { type: Number, select: true },
    lv2: { type: Number, select: true },
    lv4: { type: Number, select: true },
    make: { type: String, select: true, index: true },
    model: { type: String, select: true, index: true },
    trany: { type: String, select: true },
    VClass: { type: String, select: true },
    year: { type : Number, select: true, index: true }
  });

  try { // catch multiple calls in tests
    opts.mongoose.model('car', carSchema);
  } catch (error) {}

  return opts.mongoose.model('car');
};
/*
 *
{
    "_id" : ObjectId("58dcd611bf7f59ed61df4e36"),
    "cylinders" : 4,int
    "displ" : 2.0, //double
    "drive" : "Rear-Wheel Drive", //str
    "engId" : 9011, //int
    "eng_dscr" : "(FFS)", //str
    "fuelType" : "Regular", //str
    "fuelType1" : "Regular Gasoline", //str
    "id" : 1, //int
    "lv2" : 0, //int
    "lv4" : 0, //int
    "make" : "Alfa Romeo", //str
    "model" : "Spider Veloce 2000", //str
    "trany" : "Manual 5-spd", //str
    "VClass" : "Two Seaters", //str
    "year" : 1985 //int
}
*/