// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'SuFu SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);

			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || userAgent.includes('subconverter') || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !userAgent.includes('subconverter') && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl);
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			// 新增注释：以下代码用于对结果进行Base64编码
			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				// 新增注释：若btoa不支持，则调用自定义函数encodeBase64进行编码
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 新增注释：构建响应头对象，并根据订阅格式及令牌选择返回不同内容
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				// 新增注释：构建用于clash订阅格式转换的URL
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				// 新增注释：构建用于singbox订阅格式转换的URL
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				// 新增注释：构建用于surge订阅格式转换的URL
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl);//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
<style>
	body {
		width: 80%;
		margin: 0 auto;
		font-family: 'Arial', sans-serif;
		background-color: #f4f4f4;
		color: #333;
	}
	h1 {
		color: #4CAF50;
	}
	p {
		line-height: 1.6;
	}
	.container {
		background: #fff;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.link {
		color: #4CAF50;
		text-decoration: none;
	}
	.link:hover {
		text-decoration: underline;
	}
.qr-container { flex-shrink: 0; } 
        
.qr-container {
    flex-shrink: 0;
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.4s ease, opacity 0.4s ease;
}
.qr-container.active {
    max-height: 260px; /* 比二维码高度略高 */
    opacity: 1;
}
    </style>
	</head>
<body>
	<div class="container">
		<h1>Welcome to nginx!</h1>
		<p>If you see this page, the nginx web server is successfully installed and
		working. Further configuration is required.</p>
		
		<p>For online documentation and support please refer to
		<a class="link" href="http://nginx.org/">nginx.org</a>.<br/>
		Commercial support is available at
		<a class="link" href="http://nginx.com/">nginx.com</a>.</p>
		
		<p><em>Thank you for using nginx.</em></p>
	</div>
</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<title>${FileName} 订阅编辑</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<script src="https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js"></script>
					<style>
						body {
							margin: 0;
							padding: 2%;
							box-sizing: border-box;
							font-size: 15px;
						}
						/* 添加复制成功提示样式 */
						.copy-success {
							position: fixed;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							background: rgba(0, 0, 0, 0.8);
							color: white;
							padding: 12px 24px;
							border-radius: 4px;
							z-index: 1000;
							opacity: 0;
							visibility: hidden;
							transition: opacity 0.3s, visibility 0.3s, transform 0.3s;
							transform: translate(-50%, calc(-50% + 20px));
							pointer-events: none;
							font-size: 15px;
						}
						.copy-success.show {
							opacity: 1;
							visibility: visible;
							transform: translate(-50%, -50%);
						}
						/* 添加密码输入弹窗样式 */
						.password-dialog {
							position: fixed;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							background: white;
							padding: 20px;
							border-radius: 8px;
							box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
							z-index: 1000;
							text-align: center;
						}
						.password-dialog h3 {
							margin: 0 0 15px;
							color: #333;
						}
						.password-dialog input {
							width: 200px;
							padding: 8px 12px;
							border: 1px solid #ddd;
							border-radius: 4px;
							margin-bottom: 15px;
							font-size: 14px;
						}
						.password-dialog input:focus {
							border-color: #4CAF50;
							outline: none;
							box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
						}
						/* 给对话框添加遮罩层 */
						.dialog-overlay {
							position: fixed;
							top: 0;
							left: 0;
							right: 0;
							bottom: 0;
							background: rgba(0, 0, 0, 0.5);
							z-index: 999;
						}
						.container {
							width: 92%;
							max-width: 1200px; /* 增加最大宽度 */
							margin: 2% auto;
							padding: 2.5%;
							background: #fff;
							border-radius: 12px;
							box-shadow: 0 2px 20px rgba(0,0,0,0.1);
							font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
						}
						.section {
							margin-bottom: 2.5%;
							padding: 2.5%;
							background: #f8f9fa;
							border-radius: 12px; /* 增加圆角 */
							transition: all 0.3s ease;
						}
						.qr-container {
							flex-shrink: 0;
							overflow: hidden;
							max-height: 0;
							opacity: 0;
							transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
							margin: 0 auto;
						}
						.qr-container.active {
							max-height: 260px;
							opacity: 1;
							margin: 1% auto;
						}
						.section-title {
							margin: 0 0 16px 0;
							font-size: 1.5em;
							font-weight: 600;
							text-align: center;
						}
						.section-title a.sufu-link {
							color: #2196F3;
							text-decoration: none;
						}
						.section-title span {
							color: #333;
						}
						.editor {
							width: 98%;  /* 增加编辑框宽度 */
							max-width: 1100px; /* 增加最大宽度 */
							height: 400px; /* 增加高度 */
							margin: 15px auto;
							padding: 20px;
							border: 1px solid #e0e0e0;
							border-radius: 8px;
							font-family: 'Consolas', monospace;
							font-size: 14px; /* 编辑器字体大小 */
							line-height: 1.5;
							display: block;
							resize: vertical; /* 允许垂直拖动调整大小 */
							background: #fafafa;
						}
						.save-btn {
							background: #4CAF50; /* 更改按钮颜色 */
							color: white;
							padding: 10px 25px;
							border: none;
							border-radius: 5px;
							font-size: 15px;
							cursor: pointer;
							transition: all 0.3s ease;
							box-shadow: 0 2px 5px rgba(0,0,0,0.1);
						}
						.save-btn:hover {
							background: #45a049;
							box-shadow: 0 4px 8px rgba(0,0,0,0.15);
						}
						.save-btn:disabled {
							background: #cccccc;
							cursor: not-allowed;
						}
						.sub-item a {
							color: #2196F3;
							text-decoration: none;
							padding: 10px 0; /* 增加点击区域 */
							display: block;
							font-size: 15px; /* 增大字体 */
						}
						.sub-item a span {
							color: #333;
							margin-right: 8px;
							font-weight: 500;
						}
						.save-container {
							text-align: center;
							margin: 20px 0;
						}
						#saveStatus {
							display: inline-block;
							margin-left: 15px;
							font-size: 14px;
							color: #666;
						}
						.password-dialog button {
							padding: 10px 25px;
							margin: 0 8px;
							border: none;
							border-radius: 5px;
							cursor: pointer;
							transition: all 0.3s;
							font-size: 14px;
						}
						.password-dialog button.confirm {
							background: #4CAF50;
							color: white;
						}
						.password-dialog button.cancel {
							background: #f1f1f1;
							color: #666;
						}
						.password-dialog button:hover {
							opacity: 0.9;
							transform: translateY(-1px);
						}
						/* 优化访客订阅按钮样式 */
						.notice-toggle {
							display: block;
							text-align: center;
							padding: 15px 20px;
							margin: 20px auto;
							background: #f8f9fa;
							border: 2px solid #e9ecef;
							border-radius: 8px;
							color: #2196F3;
							font-size: 16px;
							font-weight: 500;
							text-decoration: none;
							transition: all 0.3s ease;
							cursor: pointer;
							width: fit-content;
							min-width: 200px;
						}
						.notice-toggle:hover {
							background: #e9ecef;
							transform: translateY(-2px);
							box-shadow: 0 2px 8px rgba(0,0,0,0.1);
						}
						/* 优化访客订阅内容的动画效果 */
						.notice-content {
							max-height: 0;
							opacity: 0;
							overflow: hidden;
							transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
							background: #f8f9fa;
							border-radius: 12px;
							padding: 0 20px;
							margin: 0;
							transform: translateY(-20px);
						}
						.notice-content.show {
							max-height: 2000px;
							opacity: 1;
							padding: 20px;
							margin: 10px 0;
							transform: translateY(0);
						}
					</style>
				</head>
				<body>
					<div id="copySuccess" class="copy-success">复制成功</div>
					<div class="container">
						<div class="section">
							<h2 class="section-title">
								<a href="https://sufu.20050626.xyz/" target="_blank" class="sufu-link">SuFu</a><span>代理订阅配置</span>
							</h2>
							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?sub', 'qrcode_0')">
									<span>自适应订阅地址:</span> https://${url.hostname}/${mytoken}?sub
								</a>
								<div id="qrcode_0" class="qr-container"></div>
							</div>
							
							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?b64', 'qrcode_1')">
									<span>Base64订阅地址:</span> https://${url.hostname}/${mytoken}?b64
								</a>
								<div id="qrcode_1" class="qr-container"></div>
							</div>

							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?clash', 'qrcode_2')">
									<span>clash订阅地址:</span> https://${url.hostname}/${mytoken}?clash
								</a>
								<div id="qrcode_2" class="qr-container"></div>
							</div>

							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?sb', 'qrcode_3')">
									<span>singbox订阅地址:</span> https://${url.hostname}/${mytoken}?sb
								</a>
								<div id="qrcode_3" class="qr-container"></div>
							</div>

							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?surge', 'qrcode_4')">
									<span>surge订阅地址:</span> https://${url.hostname}/${mytoken}?surge
								</a>
								<div id="qrcode_4" class="qr-container"></div>
							</div>
							
							<div class="sub-item">
								<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/${mytoken}?loon', 'qrcode_5')">
									<span>loon订阅地址:</span> https://${url.hostname}/${mytoken}?loon
								</a>
								<div id="qrcode_5" class="qr-container"></div>
							</div>
							
							<a class="notice-toggle" href="javascript:void(0);" id="noticeToggle" onclick="toggleNotice()">
								查看访客订阅∨
							</a>
							
							<div id="noticeContent" class="notice-content" style="display:none">
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}','guest_0')">
										<span>自适应订阅地址:</span> https://${url.hostname}/sub?token=${guest}
									</a>
									<div id="guest_0" class="qr-container"></div>
								</div>
								
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}&b64','guest_1')">
										<span>Base64订阅地址:</span> https://${url.hostname}/sub?token=${guest}&b64
									</a>
									<div id="guest_1" class="qr-container"></div>
								</div>
								
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}&clash','guest_2')">
										<span>clash订阅地址:</span> https://${url.hostname}/sub?token=${guest}&clash
									</a>
									<div id="guest_2" class="qr-container"></div>
								</div>
								
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}&sb','guest_3')">
										<span>singbox订阅地址:</span> https://${url.hostname}/sub?token=${guest}&sb
									</a>
									<div id="guest_3" class="qr-container"></div>
								</div>
								
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}&surge','guest_4')">
										<span>surge订阅地址:</span> https://${url.hostname}/sub?token=${guest}&surge
									</a>
									<div id="guest_4" class="qr-container"></div>
								</div>
								
								<div class="sub-item">
									<a href="javascript:void(0)" onclick="handleSubscription('https://${url.hostname}/sub?token=${guest}&loon','guest_5')">
										<span>loon订阅地址:</span> https://${url.hostname}/sub?token=${guest}&loon
									</a>
									<div id="guest_5" class="qr-container"></div>
								</div>
							</div>
						</div>
						
						<hr class="divider">
						
						<div class="section">
							<h2 class="section-title">SuFu代理订阅编辑</h2>
							${hasKV ? `
							<textarea class="editor" id="content">${content}</textarea>
							<div class="save-container">
								<button class="save-btn" onclick="saveContent(this)">保存</button>
								<span class="status" id="saveStatus"></span>
							</div>
							` : '<p>请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的KV命名空间</p>'}
						</div>
						
						<div class="section">
							<small>UA: <strong>${request.headers.get('User-Agent')}</strong></small>
						</div>
					</div>
					<script>
					function showCopySuccess() {
						const copySuccess = document.getElementById('copySuccess');
						if (copySuccess) {
							clearTimeout(copySuccess.timer);
							copySuccess.classList.add('show');
							
							copySuccess.timer = setTimeout(() => {
								copySuccess.classList.remove('show');
							}, 1500);
						} else {
							const div = document.createElement('div');
							div.id = 'copySuccess';
							div.className = 'copy-success';
							div.textContent = '复制成功';
							document.body.appendChild(div);
							
							requestAnimationFrame(() => {
								div.classList.add('show');
								div.timer = setTimeout(() => {
									div.classList.remove('show');
									setTimeout(() => {
										if (document.body.contains(div)) {
											document.body.removeChild(div);
										}
									}, 300);
								}, 1500);
							});
						}
					}
					
					function handleSubscription(text, qrcodeId) {
						// 复制到剪贴板
						const textarea = document.createElement('textarea');
						textarea.value = text;
						textarea.style.position = 'fixed';
						textarea.style.opacity = '0';
						document.body.appendChild(textarea);
						textarea.select();
						try {
							document.execCommand('copy');
							showCopySuccess();
						} catch (err) {
							console.error('复制失败:', err);
						}
						document.body.removeChild(textarea);
						
						// 切换二维码显示/隐藏
						const qrcodeDiv = document.getElementById(qrcodeId);
						if (qrcodeDiv) {
							// 关闭其他打开的二维码
							document.querySelectorAll('.qr-container.active').forEach(container => {
								if(container !== qrcodeDiv) {
									container.classList.remove('active');
								}
							});
							
							if (!qrcodeDiv.classList.contains('active')) {
								qrcodeDiv.classList.add('active');
								if (!qrcodeDiv.hasChildNodes()) {
									new QRCode(qrcodeDiv, {
										text: text,
										width: 220,
										height: 220,
										colorDark: "#000000",
										colorLight: "#ffffff",
										correctLevel: QRCode.CorrectLevel.H
									});
								}
							} else {
								qrcodeDiv.classList.remove('active');
							}
						}
					}

					function toggleNotice() {
							const noticeContent = document.getElementById('noticeContent');
							const noticeToggle = document.getElementById('noticeToggle');
							
							// 关闭所有打开的二维码
							document.querySelectorAll('.qr-container.active').forEach(container => {
								container.classList.remove('active');
							});
							
							if (!noticeContent.classList.contains('show')) {
								// 展开动画
								noticeContent.style.display = 'block';
								requestAnimationFrame(() => {
									noticeContent.classList.add('show');
									noticeToggle.style.background = '#e9ecef';
									noticeToggle.textContent = '收起访客订阅 ∧';
								});
							} else {
								// 收起动画
								noticeContent.classList.remove('show');
								noticeToggle.style.background = '#f8f9fa';
								noticeToggle.textContent = '查看访客订阅 ∨';
								setTimeout(() => {
									if (!noticeContent.classList.contains('show')) {
										noticeContent.style.display = 'none';
									}
								}, 600); // 与 CSS transition 时间匹配
							}
						}
						
					if (document.querySelector('.editor')) {
						let timer;
						let saving = false;  // 添加保存状态标志
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
						function saveContent(button) {
							if (saving) return; // 如果正在保存，直接返回
							saving = true;
							
							try {
								// 检查是否是首次保存
								if(!localStorage.getItem('hasPassword')) {
									showPasswordDialog((password) => {
										if(password === '050626') {
											localStorage.setItem('hasPassword', 'true');
											saveContentImpl(button);
										} else {
											alert('密码错误');
											saving = false;
										}
									});
									return;
								}
								saveContentImpl(button);
							} catch (error) {
								console.error('保存过程出错:', error);
								button.textContent = '保存';
								button.disabled = false;
								saving = false;
							}
						}

						function showPasswordDialog(callback) {
							// 创建遮罩层
							const overlay = document.createElement('div');
							overlay.className = 'dialog-overlay';
							document.body.appendChild(overlay);
							
							const dialog = document.createElement('div');
							dialog.className = 'password-dialog';
							dialog.innerHTML = 
								'<h3>请输入密码</h3>' +
								'<input type="password" id="password-input" placeholder="请输入密码" autocomplete="off">' +
								'<div>' +
									'<button class="confirm">确认</button>' +
									'<button class="cancel">取消</button>' +
								'</div>';

							document.body.appendChild(dialog);

							const input = dialog.querySelector('input');
							const confirmBtn = dialog.querySelector('.confirm');
							const cancelBtn = dialog.querySelector('.cancel');

							const closeDialog = (shouldReset = true) => {
								document.body.removeChild(dialog);
								document.body.removeChild(overlay);
								if (shouldReset) saving = false; // 取消时重置保存状态
							};

							confirmBtn.onclick = function() {
								const password = input.value;
								closeDialog(false); // 确认时不重置状态
								callback(password);
							};

							cancelBtn.onclick = () => closeDialog(true);
							overlay.onclick = () => closeDialog(true);

							input.focus();
							input.onkeyup = function(e) {
								if (e.key === 'Enter') confirmBtn.click();
								if (e.key === 'Escape') cancelBtn.click();
							};
						}

						function saveContentImpl(button) {
							const updateButtonText = (step) => {
								button.textContent = 'Saving: ' + step;  // 修改这里,避免使用模板字符串和中文
							};
							
							// 检测是否为iOS设备
							const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
							
							// 仅在非iOS设备上执行replaceFullwidthColon
							if (!isIOS) {
								replaceFullwidthColon();
							}
							updateButtonText('Started');  // 英文状态提示
							button.disabled = true;

							// 获取textarea内容和原始内容
							const textarea = document.getElementById('content');
							if (!textarea) {
								throw new Error('Cannot find content area');
							}

							updateButtonText('Getting content');
							let newContent;
							let originalContent;
							try {
								newContent = textarea.value || '';
								originalContent = textarea.defaultValue || '';
							} catch (e) {
								console.error('Content error:', e);
								throw new Error('Cannot get content');
							}

							updateButtonText('准备状态更新函数');
							const updateStatus = (message, isError = false) => {
								const statusElem = document.getElementById('saveStatus');
								if (statusElem) {
									statusElem.textContent = message;
									statusElem.style.color = isError ? 'red' : '#666';
								}
							};

							updateButtonText('准备按钮重置函数');
							const resetButton = () => {
								button.textContent = '保存';
								button.disabled = false;
							};

							if (newContent !== originalContent) {
								updateButtonText('发送保存请求');
								fetch(window.location.href, {
									method: 'POST',
									body: newContent,
									headers: {
										'Content-Type': 'text/plain;charset=UTF-8'
									},
									cache: 'no-cache'
								})
								.then(response => {
									updateButtonText('检查响应状态');
									if (!response.ok) {
										throw new Error(\`HTTP error! status: \${response.status}\`);
									}
									updateButtonText('更新保存状态');
									const now = new Date().toLocaleString();
									document.title = \`编辑已保存 \${now}\`;
									updateStatus(\`已保存 \${now}\`);
								})
								.catch(error => {
									updateButtonText('处理错误');
									console.error('Save error:', error);
									updateStatus(\`保存失败: \${error.message}\`, true);
								})
								.finally(() => {
									resetButton();
									saving = false;  // 重置保存状态
								});
							} else {
								updateButtonText('检查内容变化');
								updateStatus('内容未变化');
								resetButton();
							}
						}
		
						// 只保留自动保存的事件监听
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(() => saveContent(), 5000);
						});
					}

					function toggleNotice() {
							const noticeContent = document.getElementById('noticeContent');
							const noticeToggle = document.getElementById('noticeToggle');
							if (!noticeContent.classList.contains('show')) {
								noticeContent.style.display = 'block';
								// 使用setTimeout确保display生效后再添加show类
								setTimeout(() => {
									noticeContent.classList.add('show');
								}, 10);
								noticeToggle.textContent = '隐藏访客订阅∧';
							} else {
								noticeContent.classList.remove('show');
								// 等待动画完成后再隐藏元素
								setTimeout(() => {
									noticeContent.style.display = 'none';
								}, 400); // 与过渡时间匹配
								noticeToggle.textContent = '查看访客订阅∨';
							}
						}
						
						// 初始化 noticeContent 的样式
						document.addEventListener('DOMContentLoaded', () => {
							const noticeContent = document.getElementById('noticeContent');
							noticeContent.style.display = 'none';
						});
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
