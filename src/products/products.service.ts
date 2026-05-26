import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { randomUUID } from 'node:crypto';

// Array tipado no service + os 5 métodos (findAll, findOne, create, update, remove)

@Injectable()
export class ProductsService {
  private readonly mockProducts: Product[] = [
    { id: '1', name: 'Product 1', price: 10.99, stock: 100 },
    { id: '2', name: 'Product 2', price: 19.99, stock: 50 },
    { id: '3', name: 'Product 3', price: 5.99, stock: 200 },
  ];

  findAll(): Product[] {
    return this.mockProducts;
  }

  findOne(id: string): Product {
    const product = this.mockProducts.find((p) => p.id === id);

    if (!product) throw new NotFoundException();

    return product;
  }

  create(product: Omit<Product, 'id'>): Product {
    const newProduct = { ...product, id: randomUUID() };
    this.mockProducts.push(newProduct);

    return newProduct;
  }

  update(id: string, product: Omit<Product, 'id'>): Product {
    const productToBeUpdated = this.mockProducts.findIndex((p) => p.id === id);

    if (productToBeUpdated < 0) throw new NotFoundException();
    this.mockProducts[productToBeUpdated] = { ...product, id };
    return this.mockProducts[productToBeUpdated];
  }

  remove(id: string): void {
    const index = this.mockProducts.findIndex((p) => p.id === id);
    if (index < 0) throw new NotFoundException();
    this.mockProducts.splice(index, 1);
  }
}
