import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// 1. Carrega o .env para a memória do processo
dotenv.config();

// 2. Instancia SEM NENHUM OBJETO dentro.
// Ele vai buscar a variável DATABASE_URL automaticamente.
export const prisma = new PrismaClient();