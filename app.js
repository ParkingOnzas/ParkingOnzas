import express from "express";
import fs from "fs";
import qr from "qrcode";
import bcrypt from 'bcrypt';
import {
    InsertAdmin,
    InsertUser,
    InsertVehicle,
    deleteAdmins,
    deleteUsuarios,
    getAdmins,
    getClaveElectoral,
    getClaveUsuario,
    getPlaca,
    getUsers,
    getNoSerie,
    deleteVehicle,
    UpdateAdmins,
    InsertQr,
    updateUsuario,
    updateVehiculo,
    updateQr,
    getClaveUsuarioUnico,
    getPlacaUnico,
    getNoSerieUnico,
    LoginAdmins,
    LoginUsers,
    getPlaca_NoSerie,
    IdQr,
    Hour_Register,
    Hour_Entry,
    getHistory,
    deleteQr,
    getClaveAdminUnico,
    Verify_Hour,
} from "./database.js";
import cors from 'cors';

const corsOptions = {
    methods: ["POST","GET"],
    credentials: true,
};
const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('imgs'));

app.listen(8080, () => {
    console.log('Server running');
});

// Función para generar el código QR
async function generarCodigoQR(datosUsuario) {
    try {
        const datosCodigoQR = `Nombre:${datosUsuario.nombre}\nApellidos:${datosUsuario.apellidos}\nDomicilio:${datosUsuario.domicilio}\nClave Electoral:${datosUsuario.clave_electoral}\nPlaca:${datosUsuario.placa}\nNo Serie:${datosUsuario.no_serie}\nMarca:${datosUsuario.marca}\nModelo:${datosUsuario.modelo}\nColor:${datosUsuario.color}`;
        const rutaCodigoQR = `imgs/${datosUsuario.clave_electoral}.png`;
        await qr.toFile(rutaCodigoQR, datosCodigoQR);
        return rutaCodigoQR;
    } catch (error) {
        console.error("Error al generar el código QR:", error);
    }
}
// Ruta para servir la imagen
app.get("/imagen/:nombreImagen", (req, res) => {
    const nombreImagen = req.params.nombreImagen;
    const rutaImagen = path.join(__dirname, "imgs", nombreImagen);
    res.sendFile(rutaImagen);
});


// Registro de Usuarios
app.post("/usuarios", async (req, res) => {
    try {
        const { nombre, apellidos, domicilio, clave_electoral, contraseña, placa, no_serie, marca, modelo, color } = req.body;
        const claveExistente = await getClaveUsuario(clave_electoral);
        const claveExistentepri = await getClaveElectoral(clave_electoral);
        
        if (claveExistente || claveExistentepri) {
            return res.status(400).send({ message: "La clave electoral ya existe" });
        } else if (await getPlaca(placa)) {
            return res.status(400).send({ message: "La placa ya existe" });
        } else if (await getNoSerie(no_serie)) {
            return res.status(400).send({ message: "El número de serie ya existe" });
        } else {
            // Generar código QR
            const rutaCodigoQR = await generarCodigoQR(req.body);
            if(rutaCodigoQR){
                const idUsuario = await InsertUser(nombre, apellidos, domicilio, clave_electoral, contraseña);
                if(idUsuario){
                    const idVehicle = await InsertVehicle(placa, no_serie, marca, modelo, color, idUsuario);
                    if(idVehicle){
                        const idQr = await InsertQr(idVehicle,rutaCodigoQR);
                        if(idQr){
                            res.status(201).send({ message: "Se ha registrado correctamente"});
                        }
                        else{
                            res.status(400).send({ message: "Error al insertar el qr" });
                        }
                    }
                    else{
                        res.status(400).send({ message: "Error al insertar el vehiculo" });
                    }
                }
                else{
                    res.status(400).send({ message: "Error al insertar el usuario" });
                }
            }
            else{
                res.status(400).send({ message: "Ha ocurrido un error al generar el codigo qr" });
            }
        }
    } catch (error) {
        res.status(500).send({message:"Error interno del servidor" + error});
    }
});

// Registro de Administradores
app.post("/RegisterAdmins", async (req,res)=>{
    try{
        const { tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri,contrasena } = req.body;
        const existingClaveAdmin = await getClaveElectoral(clave_electoral_pri);
        const existingClaveUser = await getClaveUsuario(clave_electoral_pri)
        if (existingClaveAdmin || existingClaveUser) {
            return res.status(400).send({ message: "La clave electoral ya existe" });
        }

        const result = await InsertAdmin(tipo_usuario,nombre,apellidos,domicilio,clave_electoral_pri, contrasena);
        res.status(201).send({ message:"Se ha registrado correctamente"});
    } catch(error){
        res.status(500).send("No se ha registrado");
    }
})
//Obtencion de Administradores
app.get("/getAdmins", async (req, res)=>{
    try{
        const result = await getAdmins(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
})
//Eliminacion de Administradores
app.delete("/deleteAdmins/:id_usuario_p", async (req, res) => {
    try{
        const { id_usuario_p } = req.body;
        await deleteAdmins(req.params.id_usuario_p, id_usuario_p);
        res.status(200).send({message:'Se ha eliminado correctamente'});
    }catch(error){
        res.status(500).send({message:'Error al eliminar el administrador'});
    }
});
//Modificacion de Administradores
app.put("/UpdateAdmins", async (req,res)=>{
    try{
        const { id_usuario_pri,tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena } = req.body;
        const existingClaveUser = await getClaveUsuario(clave_electoral_pri);
        const existingClaveAdmin = await getClaveAdminUnico(clave_electoral_pri,id_usuario_pri);
        if (existingClaveUser || existingClaveAdmin) {
            res.status(400).send({ message: "La clave electoral ya existe" });
        }
        else{
            const result = await UpdateAdmins(id_usuario_pri, tipo_usuario, nombre, apellidos, domicilio, clave_electoral_pri, contrasena);
            res.status(200).send({ message:"Se ha actualizado correctamente"});
        }
    } catch(error){
        console.error(error);
        res.status(500).send("No se ha actualizado");
    }
})
//Modificacion de Usuarios
app.put("/UpdateUsers", async (req,res)=>{
    try{
        const { id_usuario, nombre, apellidos, domicilio, clave_electoral, contraseña, placa, no_serie, marca, modelo, color } = req.body;
        const getClave = await getClaveUsuarioUnico(id_usuario,clave_electoral);
        const getClaveAdmin = await getClaveElectoral(clave_electoral);
        const getplaca = await getPlacaUnico(id_usuario,placa);
        const getNo_Serie = await getNoSerieUnico(id_usuario,no_serie);
        if(getClave || getClaveAdmin){
            res.status(500).send({message:'La clave electoral ya existe'});
        }
        else if(getplaca){
            res.status(500).send({message:'La placa ya existe'});
        }
        else if(getNo_Serie){
            res.status(500).send({message:'El No Serie ya existe'});
        }
        else{
            const userUpdate = await updateUsuario(id_usuario, nombre, apellidos, domicilio, clave_electoral, contraseña);
            if(userUpdate){
                const userVehicle = await updateVehiculo(id_usuario, placa, no_serie, marca, modelo, color);
                if(userVehicle){
                    const rutaCodigoQR = await generarCodigoQR(req.body);
                    if(rutaCodigoQR){
                        const qrUpdate = await updateQr(userVehicle, rutaCodigoQR);
                        res.status(200).send({message:'Se ha actualizado correctamente'});
                    }
                    else{
                        res.status(500).send({message:'No se ha actualizado correctamente'});
                    }
                }
            }
        }
    } catch(error){
        console.error(error);
        res.status(500).send({message:"No se ha actualizado"});
    }
})
//Obtencion de Usuarios
app.get("/getUsuarios", async (req, res)=>{
    try{
        const result = await getUsers(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
})
//Eliminacion de usuarios
app.delete("/deleteUsers/:id_usuario", async (req, res) => {
    try{
        const { id_usuario } = req.body;
        const result = await deleteVehicle(req.params.id_usuario, id_usuario);
        if(result){
            const result1 = await deleteUsuarios(req.params.id_usuario, id_usuario);
            if(result1){
                res.status(200).send({message:'Se ha eliminado correctamente'});
            }
            else{
                res.status(500).send({message:'Error al eliminar el vehiculo'});
            }
        }
        else{
            res.status(500).send({message:'Error al eliminar el usuario'});
        }
    }catch(error){
        res.status(500).send({message:'Error al eliminar el usuario'});
    }
});
//Login
app.post('/Login', async (req, res)=>{
    try{
        const {clave_electoral,contrasena} = req.body;
        const datos = await LoginAdmins(clave_electoral,contrasena);
        if(datos){
            res.status(200).send(datos);
        }
        else{
            const data = await LoginUsers(clave_electoral,contrasena);
            if(data){
                res.status(200).send(data);
            }
            else{
                res.status(500).send({message:'Usuario y Contrasena Incorrectos'});
            }
        }
    } catch(error){
        res.status(500).send({message:'Error interno del servidor'});
    }
})
app.post('/LoginUser', async (req, res)=>{
    try{
        const {clave_electoral, contrasena} = req.body;
        const datos = await LoginUsers(clave_electoral, contrasena);
        if(datos){
            res.status(200).send(datos);
        }
        else{
            res.status(500).send({message:'Usuario o Contraseña Incorrectos'});
        }
    } catch(error){
        res.status(500).send({message:'Error interno del servidor'});
    }
});
//Registro qr
app.post('/RegisterQr', async (req, res)=>{
    try{
        const { id_usuario_p,no_serie,placa } = req.body;
        const id_vehiculo = await getPlaca_NoSerie(placa,no_serie);
        if(id_vehiculo){
            const id_qr = await IdQr(id_vehiculo);
            if(id_qr){
                const datos = await Verify_Hour(id_qr);
                if(datos){
                    if(datos.estado == 'Entrada'){
                        const salida = 'Salida';
                        await Hour_Register(id_usuario_p,id_qr,salida);
                        res.status(200).send({message:'Se ha registrado la salida'});
                    }
                    else {
                        const entrada = 'Entrada';
                        await Hour_Register(id_usuario_p,id_qr,entrada);
                        res.status(200).send({message:'Se ha registrado la entrada'});
                    }
                }
                else{
                    await Hour_Entry(id_usuario_p,id_qr);
                    res.status(200).send({message:'Se ha registrado la entrada'});
                }
            }
        }
    } catch(error){
        res.status(500).send({message:'No se ha podido registrar'});
    }
})
//Obtencion del Historial
app.get("/getHistory", async (req, res)=>{
    try{
        const result = await getHistory(req.params);
        res.status(200).send(result);
    } catch(error){
        
    }
})