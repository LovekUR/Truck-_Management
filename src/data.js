import { faker } from '@faker-js/faker';

// This function creates 1000 trucks automatically
const generateTrucks = () => {
  const trucks = [];
  for (let i = 0; i < 1000; i++) {
    trucks.push({
      id: `TRK-${faker.string.alphanumeric(5).toUpperCase()}`,
      driver: faker.person.fullName(),
      origin: faker.location.city() + ", " + faker.location.state({ abbreviated: true }),
      destination: faker.location.city() + ", " + faker.location.state({ abbreviated: true }),
      status: faker.helpers.arrayElement(['In Transit', 'Loading', 'Delivered', 'On Way']),
      progress: faker.number.int({ min: 10, max: 100 }),
      image: `https://loremflickr.com{i}`
    });
  }
  return trucks;
};

export const allTrucks = generateTrucks();
