# TAW_P3

Repositorio para la práctica 3 de Tendencias Actuales de la Web.

## Material necesario

Para la generación de las credenciales SSL son imprescindibles los siguientes paquetes:
- Node.js.
- npm.
- OpenSSL.

Para desplegar el servidor web seguro es aconsejable usar la herramienta http-server (incluida como paquete npm).

Ejemplo de instalación en Ubuntu:
```
$ sudo apt-get install nodejs npm
$ sudo npm install –global http-server
```

## Ejemplo de uso de autossl y http-server

Generación de las credenciales:
```
jorge@jorge:~/Escritorio/git/TAW_P3$ node autossl.js 
Welcome to AutoSSL tool!
 Please, follow the steps to generate the credentials.
 You can use the following keyy bindings:
  - TAB: show information
  - Ctrl+C / Ctrl+D: quit
  - Ctrl+Z: undo previous command


Set the common name (example: 'taw.um.es') (step 0 / 4)

autossl> taw.um.es

Add alternative names (example: 'localhost, mydomain.com') (step 1 / 4)

autossl> localhost

Add alternative IP addresses (example: '127.0.0.1, 192.168.100.50') (step 2 / 4)

autossl> 192.168.100.2,192.168.100.29

Type 'generate' to generate credentials or 'show' to display information (step 3 / 4)

autossl> generate
Credentials were successfully generated!
```

Despliegue del servidor HTTPs:
```
jorge@jorge:~/Escritorio/git/TAW_P3$ http-server -S -C credentials/cert.pem -K credentials/key.pem 
Starting up http-server, serving ./ through https
Available on:
  https://127.0.0.1:8081
  https://192.168.100.29:8081
  https://192.168.100.2:8081
Hit CTRL-C to stop the server
```
