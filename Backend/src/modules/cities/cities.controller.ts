import type { Request, Response } from 'express';
import * as citiesService from './cities.service.js';

export async function listCitiesHandler(req: Request, res: Response) {
  const { search, country, region, sort } = req.query;
  const cities = await citiesService.listCities({
    search: typeof search === 'string' ? search : undefined,
    country: typeof country === 'string' ? country : undefined,
    region: typeof region === 'string' ? region : undefined,
    sort: sort === 'name' || sort === 'cost' || sort === 'popularity' ? sort : undefined,
  });
  res.status(200).json(cities);
}

export async function getCityHandler(req: Request, res: Response) {
  const city = await citiesService.getCityById(req.params.id);
  res.status(200).json(city);
}
