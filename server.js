const express=require("express"),path=require("path"),fs=require("fs"),crypto=require("crypto");
const app=express(),PORT=process.env.PORT||3000,DATA=path.join(__dirname,"data.json");
app.disable("x-powered-by");
app.use((req,res,next)=>{res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Referrer-Policy","strict-origin-when-cross-origin");next()});
const ADMIN_USER=process.env.ADMIN_USER||"admin";
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD;
const SESSION_SECRET=process.env.SESSION_SECRET;

if(!ADMIN_PASSWORD||!SESSION_SECRET){
  console.error("Faltan ADMIN_PASSWORD y/o SESSION_SECRET en las variables de entorno.");
  process.exit(1);
}
const defaults={title:"LAS ESTRELLAS",subtitle:"Elegí una opción para continuar",buttonText:"WhatsApp",background:"#080808",cardColor:"#151515",primaryColor:"#d4af37",textColor:"#f5f5f5",secondaryTextColor:"#b8b8b8",font:"Arial, sans-serif",logoUrl:"",pixelId:"",message:"Hola, quiero más información.",rotation:true,numbers:[{label:"WHATSAPP 1",number:"+5490000000000",enabled:true},{label:"WHATSAPP 2",number:"+5490000000000",enabled:true},{label:"WHATSAPP 3",number:"+5490000000000",enabled:true}]};
if(!fs.existsSync(DATA))fs.writeFileSync(DATA,JSON.stringify(defaults,null,2));
function read(){try{return JSON.parse(fs.readFileSync(DATA,"utf8"))}catch{return defaults}}
function clean(c){return {title:String(c.title||"LAS ESTRELLAS").slice(0,120),subtitle:String(c.subtitle||"").slice(0,300),buttonText:String(c.buttonText||"WhatsApp").slice(0,60),background:String(c.background||"#080808"),cardColor:String(c.cardColor||"#151515"),primaryColor:String(c.primaryColor||"#d4af37"),textColor:String(c.textColor||"#fff"),secondaryTextColor:String(c.secondaryTextColor||"#b8b8b8"),font:String(c.font||"Arial, sans-serif").slice(0,100),logoUrl:String(c.logoUrl||"").slice(0,500),pixelId:String(c.pixelId||"").replace(/[^0-9]/g,"").slice(0,20),message:String(c.message||"").slice(0,500),rotation:Boolean(c.rotation),numbers:Array.isArray(c.numbers)?c.numbers.slice(0,10).map((n,i)=>({label:String(n.label||`WhatsApp ${i+1}`).slice(0,60),number:String(n.number||"").slice(0,40),enabled:Boolean(n.enabled)})):[]}}
function token(user){const payload=Buffer.from(JSON.stringify({u:user,e:Date.now()+1000*60*60*12})).toString("base64url");const sig=crypto.createHmac("sha256",SESSION_SECRET).update(payload).digest("base64url");return payload+"."+sig}
function validToken(t){try{const [p,s]=String(t||"").split(".");if(!p||!s)return false;const expected=crypto.createHmac("sha256",SESSION_SECRET).update(p).digest("base64url");if(s.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return false;const x=JSON.parse(Buffer.from(p,"base64url").toString());return x.u===ADMIN_USER&&x.e>Date.now()}catch{return false}}
function auth(req,res,next){if(validToken(req.headers.cookie?.match(/(?:^|;\s*)ls_session=([^;]+)/)?.[1]))return next();return res.status(401).json({ok:false,error:"No autorizado"})}
app.use(express.json({limit:"100kb"}));app.use(express.static(path.join(__dirname,"public")));
app.post("/api/login",(req,res)=>{const {username,password}=req.body||{};if(username!==ADMIN_USER||password!==ADMIN_PASSWORD)return res.status(401).json({ok:false,error:"Usuario o contraseña incorrectos"});res.setHeader("Set-Cookie",`ls_session=${token(username)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${process.env.NODE_ENV==="production"?"; Secure":""}`);res.json({ok:true})});
app.post("/api/logout",(req,res)=>{res.setHeader("Set-Cookie","ls_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");res.json({ok:true})});
app.get("/api/config",(req,res)=>res.json(read()));
app.get("/api/admin-config",auth,(req,res)=>res.json(read()));
app.post("/api/config",auth,(req,res)=>{const c=clean(req.body);fs.writeFileSync(DATA,JSON.stringify(c,null,2));res.json({ok:true,config:c})});
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));
app.listen(PORT,()=>console.log(`LAS ESTRELLAS activa en puerto ${PORT}`));