<<<<<<< HEAD
# 📊 Freelance Portfolio Manager CLI  

> Herramienta de línea de comandos (CLI) para gestionar **clientes**, **proyectos**, **contratos**, **entregables** y **finanzas** como freelancer.  
> Desarrollada en **Node.js** con **MongoDB**, aplicando principios **SOLID**, patrones de diseño como **Repository** y **Command**, y soporte real para transacciones.

<img width="512" height="405" alt="demo-cli" src="https://github.com/user-attachments/assets/a50100e3-f348-482a-a572-a3a8fb9e53a3" />

---

## 🔥 Características Destacadas

- ✅ **CRUD completo** de clientes, propuestas, proyectos y contratos.
- 🔁 **Transacciones en MongoDB** para entregables y finanzas.
- 🧠 **Proyectos generados automáticamente** desde propuestas aceptadas.
- 📊 **Balance financiero** con filtros por cliente y fecha.
- 🖥️ **Interfaz CLI interactiva** con `inquirer` y `chalk`.

---

## 🛠️ Tecnologías y Arquitectura  

### 🔧 Stack Principal  
- **Node.js** (ES Modules)  
- **MongoDB** (driver oficial, sin Mongoose)  
- **Librerías utilizadas**:  
  - [`inquirer`](https://www.npmjs.com/package/inquirer) – Menús interactivos
  - [`chalk`](https://www.npmjs.com/package/chalk) – Colores y estilos en consola
  - [`dotenv`](https://www.npmjs.com/package/dotenv) – Variables de entorno
  - [`uuid`](https://www.npmjs.com/package/uuid) – Identificadores únicos
  - [`dayjs`](https://www.npmjs.com/package/dayjs) – Manejo de fechas

---

### 📐 Principios SOLID Aplicados

| Principio             | Implementación                                                  |
|-----------------------|-----------------------------------------------------------------|
| Single Responsibility | `ClientService` se encarga exclusivamente de la lógica de clientes |
| Open/Closed           | Repositorios modulares como `BaseRepository`                   |
| Dependency Inversion  | Los servicios dependen de abstracciones (repositorios)         |

---

### 🧱 Patrones de Diseño

#### 🗂 Repository  
- **Ubicación**: `src/repositories/*.js`  
- **Ejemplo**: `DeliverableRepository` encapsula operaciones MongoDB.

#### 🧭 Command  
- **Ubicación**: `src/commands/*.js`  
- **Ejemplo**: Estructura CLI basada en `inquirer`.

---

## ⚡ Instalación y Configuración

### 1. 🔽 Clona el repositorio

```
git clone https://github.com/Alejandro-846/freelance-portfolio-manager.git  
cd freelance-portfolio-manager

```
2. 📦 Instala las dependencias
```
npm install
```
3. ⚙️ Configura las variables de entorno
```
Crea un archivo .env basado en .env.example con el siguiente contenido:

env

MONGODB_URI=mongodb://localhost:27017/freelanceDB
```
```
⚠️ Asegúrate de que tu base de datos MongoDB esté corriendo en modo Replica Set para permitir transacciones.

```
4. 🚀 Ejecuta la aplicación
```

npm start
```
🎮 Uso y Funcionalidades
Al iniciar la app, accederás a un menú principal en la terminal:

```
› 👥 Gestión de Clientes  
› 📄 Gestión de Propuestas  
› 📂 Gestión de Proyectos  
› 📝 Contratos  
› 🧾 Entregables (con transacciones)  
› 💰 Finanzas
```
### Cada módulo permite:
- Crear, listar y actualizar clientes, propuestas, proyectos y contratos
- Asociar entregables con fechas y notas a los proyectos
- Ejecutar transacciones seguras en MongoDB
- Consultar balances financieros por cliente o rango de fechas
- Visualizar relaciones y estados de forma clara e interactiva

## 📎 Documentación Adicional

- 📄 Documento de planeación y documentación final del proyecto:  
  [Ver en Google Drive] ("https://docs.google.com/document/d/1vkTHkpSxDSSQ5IWIb-KT0qfH0uvzquBv/edit?usp=sharing&ouid=114322530463211248384&rtpof=true&sd=true")

### 📌 Estructura del Proyecto

 <img width="668" height="750" alt="estructura-proyecto" src="https://github.com/user-attachments/assets/e22ce666-6a3a-4f72-8c05-bcf98973f667" />

### 🧭 Roadmap (Futuro)

- Soporte para exportar datos a CSV/Excel
- Generación automática de reportes
- Notificaciones o alertas de entregables vencidos
- Interfaz gráfica (opcional con Electron)

<img width="4839" height="1329" alt="Imagen3" src="https://github.com/user-attachments/assets/d3245677-22ca-4f86-960c-46e0a594d6a6" />
=======
# freelance-portfolio-manager.
>>>>>>> 44398c7969d8f94b3149fdb63934335b64670b77
