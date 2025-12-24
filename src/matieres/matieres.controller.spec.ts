import { Test, TestingModule } from '@nestjs/testing';
import { MatieresController } from './matieres.controller';

describe('MatieresController', () => {
  let controller: MatieresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatieresController],
    }).compile();

    controller = module.get<MatieresController>(MatieresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
