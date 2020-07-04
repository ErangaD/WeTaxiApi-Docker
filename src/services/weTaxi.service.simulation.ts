import models from '../models';
import { Request, Response } from 'express';

export class WeTaxiServiceSimulation {
  private processStarted = false;

  public addTaxi = async (taxiNumber: string): Promise<any> => {
    const newTaxi = new models.Taxi({ taxiNumber: taxiNumber });
    return await newTaxi.save();
  };

  public getParkingLots = (): any => {
    models.ParkingLot.find({})
      .then((parkingLots) => {
        const parkingLotNames = parkingLots.map((lot) => lot.parkingLotName);
        console.log('Available Parking Lots:', parkingLotNames);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  public getParkingLotTaxis = (parkingLotId: string): any => {
    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        console.log(
          'Available taxis in parking lot:',
          parkingLot.parkingLotName,
          ':',
          parkingLot.taxiQueue
        );
      })
      .catch((error) => {
        console.error(error);
      });
  };

  public addBonus = (parkingLotId: string, taxiNumber: string): any => {
    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        const taxisAvailable = parkingLot.taxiQueue;
        const otherTaxis = taxisAvailable.filter(
          (existingNumber) => existingNumber != taxiNumber
        );
        if (otherTaxis.length != taxisAvailable.length) {
          otherTaxis.unshift(taxiNumber);
          parkingLot.taxiQueue = otherTaxis;
          parkingLot
            .save()
            .then((parkingLot) => {
              console.log(
                'Bonus Added: Taxi Shifted to first position of parking lot:',
                parkingLot.parkingLotName,
                parkingLot.taxiQueue
              );
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          console.error(
            parkingLotId,
            taxiNumber,
            'Invalid Request: Taxi is not available in the parking lot'
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  public addToParkingLot = async (
    parkingLotId: any,
    taxiNumber: string
  ): Promise<any> => {
    const parkingLot = await models.ParkingLot.findById(parkingLotId);
    const taxisAvailable = parkingLot.taxiQueue;
    const otherTaxis = taxisAvailable.filter(
      (existingNumber) => existingNumber != taxiNumber
    );
    if (otherTaxis.length == taxisAvailable.length) {
      otherTaxis.push(taxiNumber);
      parkingLot.taxiQueue = otherTaxis;
      parkingLot.availableSlots = parkingLot.availableSlots - 1;
      const savedParkingLot = await parkingLot.save();
      console.log(
        'Taxi Added to the queue',
        parkingLot.taxiQueue,
        'of',
        parkingLot.parkingLotName
      );
      return savedParkingLot;
    } else {
      console.error(
        'Invalid Request: Taxi is available in the parking lot already'
      );
      return 'savedParkingLot';
    }
    // models.ParkingLot.findById(parkingLotId).then(async parkingLot => {
    //   let taxisAvailable = parkingLot.taxiQueue;
    //   let otherTaxis = taxisAvailable.filter(existingNumber => existingNumber != taxiNumber);
    //   if(otherTaxis.length == taxisAvailable.length) {
    //     otherTaxis.push(taxiNumber);
    //     parkingLot.taxiQueue = otherTaxis;
    //     parkingLot.availableSlots = parkingLot.availableSlots - 1;
    //     let savedParkingLot =  await parkingLot.save();
    //     console.log("Taxi Added to the queue", parkingLot.taxiQueue, 'of', parkingLot.parkingLotName);
    //     return savedParkingLot;
    //   } else {
    //     console.error('Invalid Request: Taxi is available in the parking lot already');
    //   }
    // }).catch(error => {
    //   console.error(error);
    // });
  };

  public removeTaxi = (parkingLotId: string, taxiNumber: string): any => {
    models.ParkingLot.findById(parkingLotId)
      .then((parkingLot) => {
        const taxisAvailable = parkingLot.taxiQueue;
        const otherTaxis = taxisAvailable.filter(
          (existingNumber) => existingNumber != taxiNumber
        );
        if (otherTaxis.length != taxisAvailable.length) {
          otherTaxis.push(taxiNumber);
          parkingLot.taxiQueue = otherTaxis;
          parkingLot
            .save()
            .then((parkingLot) => {
              console.log(
                'Taxi Added to last position of parking lot:',
                parkingLot.parkingLotName,
                parkingLot.taxiQueue
              );
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          console.error(
            parkingLotId,
            taxiNumber,
            'Invalid Request: Taxi is not available in the parking lot'
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  private runWithIntervals() {
    models.ParkingLot.find({})
      .then(async (parkingLots) => {
        for (let k = 0; k < parkingLots.length; k++) {
          const parkingLot = parkingLots[k];
          this.getParkingLotTaxis(parkingLot._id);
          let randomTaxi = Math.floor(
            Math.random() * parkingLot.taxiQueue.length
          );
          let taxiName = 'Taxi:' + randomTaxi + ' ' + parkingLot.parkingLotName;
          this.addBonus(parkingLot._id, taxiName);
          setTimeout(() => {
            randomTaxi = Math.floor(
              Math.random() * parkingLot.taxiQueue.length
            );
            taxiName = 'Taxi:' + randomTaxi + ' ' + parkingLot.parkingLotName;
            this.removeTaxi(parkingLot._id, taxiName);
          }, 2000);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  public startSimulation = (req: Request, res: Response): any => {
    if (!this.processStarted) {
      this.processStarted = true;
      models.ParkingLot.find({})
        .then(async (parkingLots) => {
          for (let k = 0; k < parkingLots.length; k++) {
            const randomTaxis = 1 + Math.floor(Math.random() * 10);
            const parkingLot = parkingLots[k];
            for (let k = 0; k < randomTaxis; k++) {
              const result = await this.addTaxi(
                'Taxi:' + k + ' ' + parkingLot.parkingLotName
              );
              console.log(
                'Taxi:' + k + ' ' + parkingLot.parkingLotName,
                'saved'
              );
              await this.addToParkingLot(
                parkingLot._id,
                'Taxi:' + k + ' ' + parkingLot.parkingLotName
              );
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
      setInterval(() => {
        this.runWithIntervals();
      }, 15000);
    }
    return res.status(200).send({ result: 'Success' });
  };
}
