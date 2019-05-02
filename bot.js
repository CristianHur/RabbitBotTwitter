//Constantes
const Twit = require('twit');
const fs = require('fs');
const download = require('download-file');
const fetch = require('node-fetch');
const http = require('http');
const linku = require('url');

//Arranque
const T = new Twit({
		consumer_key: 'HEROKU_VAR',
		consumer_secret: 'HEROKU_VAR',
		access_token: 'HEROKU_VAR',
		access_token_secret: 'HEROKU_VAR',
		timeout_ms: 60 * 1000,
		strictSSL: false,
	});

var tiempoEntreEnvio = 9000000;

var urla;
console.log("FUNCIONANDO CONEJOS");
//-------------

mainprogram();
setInterval(mainprogram, tiempoEntreEnvio);

function mainprogram() {
	subr = ["Rabbits"];
	let aleatoriosubr = Math.floor((Math.random() * subr.length));
	var enlaceFetch = "https://www.reddit.com/r/" + subr[aleatoriosubr] + "/random.json?limit=1";
	fetch(enlaceFetch)
	.then(res => res.json())
	.then(res => EnvioReddit(res, subr));
}

//Función de envio de contenido a Reddit después de la consulta
function EnvioReddit(res, subreddits) {
	//VARIABLES
	let urls,
	hint,
	isNSFW,
	isNSFWpost,
	over18;

	try {
		urls = res[0].data.children[0].data.url;
		hint = res[0].data.children[0].data.post_hint;
		isNSFW = res[0].data.children[0].data.parent_whitelist_status;
		isNSFWpost = res[0].data.children[0].data.whitelist_status;
		esover18 = res[0].data.children[0].data.over_18;
	} catch (err) {
		console.log("ERROR: ENVÍO REDDIT");
	}

	//Si no se encuentra una imagen envia la de por defecto
	if ((hint != 'image')) {
		mainprogram();
		return;
	} else //Si es imagen miramos que no es NSFW y enviamos
	{

		if (isNSFW == undefined || isNSFW == null) {
			isNSFW = " ";
		}
		if (isNSFWpost == undefined || isNSFWpost == null) {
			isNSFWpost = " ";
		}

		if ((esover18 == true) || (isNSFW == 'promo_adult_nsfw') || (isNSFWpost.includes('nsfw'))) //Si es NSFW se envia otra imagen
		{
			mainprogram();
			return;

		} else //Si está todo correcto se realiza el envío del post
		{
			urla = urls;

			console.log("CONSULTA REDDIT: " + urls);
		}

	}

	descarga(); //Se descarga la imagen

}

//-----------------------------------------------------------------------------------------------

//Función que descarga la imagen
function descarga() {

	/*fs.unlink('/img/imagen.png/', (err) => {
		if (err)
			throw err;
		console.log('Imagen borrada correctamente.');
	});*/

	var opcionimg = {
		directory: "./img/",
		filename: "imagen.png"
	}

	download(urla, opcionimg, function (err) {
		if (err) {
			throw err
			console.log("Error descargando imagen")
		} else
			enviar();
	})

}

//-----------------------------------------------------------------------------------------------

//Función que envia el Tweet

function enviar() {

	var b64content = fs.readFileSync("img/imagen.png", {
			encoding: 'base64'
		})

		// first we must post the media to Twitter
		T.post('media/upload', {
			media_data: b64content
		}, function (err, data, response) {
			var mediaIdStr = data.media_id_string
				var altText = "Bunny"
				var meta_params = {
				media_id: mediaIdStr,
				alt_text: {
					text: altText
				}
			}

			T.post('media/metadata/create', meta_params, function (err, data, response) {
				if (!err) {

					var params = {
						status: "#Bunny #Bunnys #Rabbit #Conejo 🐰",
						media_ids: [mediaIdStr]
					}

					T.post('statuses/update', params, function (err, data, response) {
						console.log("Conejo enviado: " + urla);
					})
				}
			})
		})


}
//-------------------------------------------------------
