import inquirer from 'inquirer';

export async function contractMenu() {
  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Gestión de Contratos',
    choices: [
      { name: 'Crear contrato', value: 'create' },
      { name: 'Listar contratos', value: 'list' },
      { name: 'Actualizar contrato', value: 'update' },
      { name: 'Eliminar contrato', value: 'delete' },
      { name: 'Volver', value: 'back' }
    ]
  });

  switch (action) {
    case 'create':
      console.log("Creando contrato...");
      break;
    case 'list':
      console.log("Listando contratos...");
      break;
    case 'update':
      console.log("Actualizando contrato...");
      break;
    case 'delete':
      console.log("Eliminando contrato...");
      break;
    case 'back':
      return;
  }
}