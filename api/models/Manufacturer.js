const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Manufacturer extends Model { }
  
  Manufacturer.init(
    {
      id: DataTypes.INTEGER,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Manufacturer",
    },
  );

  return Manufacturer;
};