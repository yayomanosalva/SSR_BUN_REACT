import { argv } from "bun";
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import figures from 'figures';

function createDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createFile(filePath: string, content: string) {
  fs.writeFileSync(filePath, content);
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(chalk.cyan(question));
  const result = await new Promise<string>((resolve) => {
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
  return result;
}

async function selectOption(question: string, options: string[]): Promise<string> {
  console.log(chalk.cyan(question));
  options.forEach((option, index) => {
    console.log(chalk.yellow(`${figures.circle} ${index + 1}) ${option}`));
  });
  const selection = await prompt(chalk.cyan(`Seleccione una opción (1-${options.length}): `));
  const index = parseInt(selection) - 1;
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  console.log(chalk.red('Opción inválida. Por favor, intente de nuevo.'));
  return selectOption(question, options);
}

async function promptForFields(): Promise<string[]> {
  const fields: string[] = [];
  let continueAdding = true;

  while (continueAdding) {
    const fieldName = await prompt(chalk.cyan(`${figures.pointer} Nombre del campo (o presiona Enter para terminar): `));
    if (fieldName === '') {
      continueAdding = false;
    } else {
      const fieldType = await selectOption(`Tipo para ${fieldName}:`, ['string', 'number', 'boolean', 'Date', 'any']);
      fields.push(`${fieldName}: ${fieldType}`);
      console.log(chalk.green(`${figures.tick} Campo agregado: ${fieldName}: ${fieldType}`));
    }
  }

  return fields;
}

async function generateModule(moduleName: string) {
  const baseDir = path.join('src', 'core', moduleName);
  const interfaceDir = path.join('src', 'interfaces');

  // Crear directorios
  createDirectory(path.join(baseDir, 'application'));
  createDirectory(path.join(baseDir, 'domain'));
  createDirectory(path.join(baseDir, 'infrastructure'));
  createDirectory(path.join(baseDir, 'presentation'));
  createDirectory(interfaceDir);

  // Solicitar campos para la interfaz
  console.log(chalk.cyan(`\n${figures.info} Ingrese los campos para la interfaz:`));
  const fields = await promptForFields();

  // Crear archivos
  const pascalCaseName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  const camelCaseName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);

  // Domain
  createFile(path.join(baseDir, 'domain', `${pascalCaseName}.ts`), `
export class ${pascalCaseName} {
  constructor(
    ${fields.join(',\n    ')}
  ) {}
}
  `.trim());

  // Application
  createFile(path.join(baseDir, 'application', `${pascalCaseName}Service.ts`), `
import { ${pascalCaseName} } from '../domain/${pascalCaseName}';
import { I${pascalCaseName}Repository } from './I${pascalCaseName}Repository';

export class ${pascalCaseName}Service {
  constructor(private ${camelCaseName}Repository: I${pascalCaseName}Repository) {}

  async getAll(): Promise<${pascalCaseName}[]> {
    return this.${camelCaseName}Repository.getAll();
  }

  async getById(id: string): Promise<${pascalCaseName} | null> {
    return this.${camelCaseName}Repository.getById(id);
  }

  async create(${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName}> {
    return this.${camelCaseName}Repository.create(${camelCaseName});
  }

  async update(id: string, ${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName} | null> {
    return this.${camelCaseName}Repository.update(id, ${camelCaseName});
  }

  async delete(id: string): Promise<boolean> {
    return this.${camelCaseName}Repository.delete(id);
  }
}
  `.trim());

  createFile(path.join(baseDir, 'application', `I${pascalCaseName}Repository.ts`), `
import { ${pascalCaseName} } from '../domain/${pascalCaseName}';

export interface I${pascalCaseName}Repository {
  getAll(): Promise<${pascalCaseName}[]>;
  getById(id: string): Promise<${pascalCaseName} | null>;
  create(${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName}>;
  update(id: string, ${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName} | null>;
  delete(id: string): Promise<boolean>;
}
  `.trim());

  // Infrastructure
  createFile(path.join(baseDir, 'infrastructure', `${pascalCaseName}Repository.ts`), `
import { I${pascalCaseName}Repository } from '../application/I${pascalCaseName}Repository';
import { ${pascalCaseName} } from '../domain/${pascalCaseName}';

export class ${pascalCaseName}Repository implements I${pascalCaseName}Repository {
  async getAll(): Promise<${pascalCaseName}[]> {
    // Implementar lógica para obtener todos los ${camelCaseName}s
    throw new Error('Method not implemented.');
  }

  async getById(id: string): Promise<${pascalCaseName} | null> {
    // Implementar lógica para obtener un ${camelCaseName} por ID
    throw new Error('Method not implemented.');
  }

  async create(${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName}> {
    // Implementar lógica para crear un ${camelCaseName}
    throw new Error('Method not implemented.');
  }

  async update(id: string, ${camelCaseName}: ${pascalCaseName}): Promise<${pascalCaseName} | null> {
    // Implementar lógica para actualizar un ${camelCaseName}
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<boolean> {
    // Implementar lógica para eliminar un ${camelCaseName}
    throw new Error('Method not implemented.');
  }
}
  `.trim());

  // Presentation
  createFile(path.join(baseDir, 'presentation', `${pascalCaseName}Controller.ts`), `
import { ${pascalCaseName}Service } from '../application/${pascalCaseName}Service';
import { ${pascalCaseName} } from '../domain/${pascalCaseName}';
import { Elysia } from 'elysia';

export const ${camelCaseName}Routes = (app: Elysia, ${camelCaseName}Service: ${pascalCaseName}Service) => {
  app.get('/${camelCaseName}s', async () => {
    return await ${camelCaseName}Service.getAll();
  });

  app.get('/${camelCaseName}s/:id', async ({ params }) => {
    return await ${camelCaseName}Service.getById(params.id);
  });

  app.post('/${camelCaseName}s', async ({ body }) => {
    const new${pascalCaseName} = new ${pascalCaseName}(body);
    return await ${camelCaseName}Service.create(new${pascalCaseName});
  });

  app.put('/${camelCaseName}s/:id', async ({ params, body }) => {
    const updated${pascalCaseName} = new ${pascalCaseName}(body);
    return await ${camelCaseName}Service.update(params.id, updated${pascalCaseName});
  });

  app.delete('/${camelCaseName}s/:id', async ({ params }) => {
    return await ${camelCaseName}Service.delete(params.id);
  });
};
  `.trim());

  // Interface
  createFile(path.join(interfaceDir, `${moduleName}.interface.ts`), `
export interface I${pascalCaseName} {
  ${fields.join(';\n  ')};
}
  `.trim());

  console.log(chalk.green(`\n${figures.tick} Módulo "${moduleName}" generado con éxito.`));
}

const moduleName = argv[2];

if (!moduleName) {
  console.error(chalk.red(`${figures.cross} Por favor, proporciona un nombre de módulo.`));
  process.exit(1);
}

generateModule(moduleName).then(() => {
  console.log(chalk.blue(`\n${figures.info} Saliendo del programa...`));
  process.exit(0);
}).catch((error) => {
  console.error(chalk.red(`\n${figures.cross} Error: ${error.message}`));
  process.exit(1);
});