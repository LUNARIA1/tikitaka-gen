import localforage from "localforage";
import { v4 } from "uuid";
import { getDatabase } from "../../RisuAI/src/ts/storage/database.svelte";
import { checkImageType } from "../../RisuAI/src/ts/parser.svelte";
import { getModelInfo, LLMFlags } from "../../RisuAI/src/ts/model/modellist";
import * as fs from 'fs';
import * as path from 'path';

const inlayImageExts = [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'
]

const inlayAudioExts = [
    'wav', 'mp3', 'ogg', 'flac'
]

const inlayVideoExts = [
    'webm', 'mp4', 'mkv'
]

// Node.js 환경 감지
const isNodeServer = !!globalThis.__NODE__;

// IndexedDB 저장소 (웹 환경용)
const inlayStorage = localforage.createInstance({
    name: 'inlay',
    storeName: 'inlay'
});

// 파일 시스템 저장 경로 (Node.js 환경용)
const INLAY_DIR = isNodeServer ? path.join(process.cwd(), 'inlays') : null;

// Node.js 환경에서 디렉토리 초기화
if (isNodeServer && INLAY_DIR) {
    if (!fs.existsSync(INLAY_DIR)) {
        fs.mkdirSync(INLAY_DIR, { recursive: true });
        console.log('[Inlay FS] Created inlay directory:', INLAY_DIR);
    }
}

// 메타데이터 파일 경로
const getMetaPath = (id: string) => path.join(INLAY_DIR, `${id}.json`);
const getDataPath = (id: string, ext: string) => path.join(INLAY_DIR, `${id}.${ext}`);

/**
 * Node.js 파일 시스템에 저장
 */
async function saveToFileSystem(id: string, data: {
    name: string,
    data: Blob,
    ext: string,
    height?: number,
    width?: number,
    type: 'image' | 'audio' | 'video'
}) {
    if (!INLAY_DIR) return;

    try {
        // Blob을 Buffer로 변환
        const arrayBuffer = await data.data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 데이터 파일 저장
        const dataPath = getDataPath(id, data.ext);
        fs.writeFileSync(dataPath, buffer);

        // 메타데이터 저장
        const metaPath = getMetaPath(id);
        const metadata = {
            name: data.name,
            ext: data.ext,
            height: data.height,
            width: data.width,
            type: data.type,
            createdAt: new Date().toISOString()
        };
        fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

        console.log(`[Inlay FS] Saved: ${id}.${data.ext} (${buffer.length} bytes)`);
    } catch (error) {
        console.error('[Inlay FS] Save failed:', error);
        throw error;
    }
}

/**
 * Node.js 파일 시스템에서 로드
 */
async function loadFromFileSystem(id: string): Promise<{
    name: string,
    data: Blob,
    ext: string,
    height: number,
    width: number,
    type: 'image' | 'audio' | 'video'
} | null> {
    if (!INLAY_DIR) return null;

    try {
        // 메타데이터 로드
        const metaPath = getMetaPath(id);
        if (!fs.existsSync(metaPath)) {
            return null;
        }

        const metadataStr = fs.readFileSync(metaPath, 'utf-8');
        const metadata = JSON.parse(metadataStr);

        // 데이터 파일 로드
        const dataPath = getDataPath(id, metadata.ext);
        if (!fs.existsSync(dataPath)) {
            return null;
        }

        const buffer = fs.readFileSync(dataPath);
        const blob = new Blob([buffer], { type: `${metadata.type}/${metadata.ext}` });

        return {
            name: metadata.name,
            data: blob,
            ext: metadata.ext,
            height: metadata.height || 0,
            width: metadata.width || 0,
            type: metadata.type
        };
    } catch (error) {
        console.error('[Inlay FS] Load failed:', error);
        return null;
    }
}

/**
 * Node.js 파일 시스템에서 삭제
 */
async function deleteFromFileSystem(id: string) {
    if (!INLAY_DIR) return;

    try {
        const metaPath = getMetaPath(id);
        if (fs.existsSync(metaPath)) {
            const metadataStr = fs.readFileSync(metaPath, 'utf-8');
            const metadata = JSON.parse(metadataStr);

            const dataPath = getDataPath(id, metadata.ext);
            if (fs.existsSync(dataPath)) {
                fs.unlinkSync(dataPath);
            }
            fs.unlinkSync(metaPath);

            console.log(`[Inlay FS] Deleted: ${id}`);
        }
    } catch (error) {
        console.error('[Inlay FS] Delete failed:', error);
    }
}

/**
 * 모든 inlay ID 목록 가져오기
 */
async function getAllInlayKeys(): Promise<string[]> {
    if (isNodeServer && INLAY_DIR) {
        try {
            const files = fs.readdirSync(INLAY_DIR);
            const ids = files
                .filter(f => f.endsWith('.json'))
                .map(f => f.replace('.json', ''));
            return ids;
        } catch (error) {
            console.error('[Inlay FS] Failed to list files:', error);
            return [];
        }
    } else {
        return await inlayStorage.keys();
    }
}

export async function postInlayAsset(img:{
    name:string,
    data:Uint8Array
}){

    const extention = img.name.split('.').at(-1)
    const imgObj = new Image()

    if(inlayImageExts.includes(extention)){
        imgObj.src = URL.createObjectURL(new Blob([img.data], {type: `image/${extention}`}))

        return await writeInlayImage(imgObj, {
            name: img.name,
            ext: extention
        })
    }

    if(inlayAudioExts.includes(extention)){
        const audioBlob = new Blob([img.data], {type: `audio/${extention}`})
        const imgid = v4()

        if (isNodeServer) {
            await saveToFileSystem(imgid, {
                name: img.name,
                data: audioBlob,
                ext: extention,
                type: 'audio'
            });
        } else {
            await inlayStorage.setItem(imgid, {
                name: img.name,
                data: audioBlob,
                ext: extention,
                type: 'audio'
            });
        }

        return `${imgid}`
    }

    if(inlayVideoExts.includes(extention)){
        const videoBlob = new Blob([img.data], {type: `video/${extention}`})
        const imgid = v4()

        if (isNodeServer) {
            await saveToFileSystem(imgid, {
                name: img.name,
                data: videoBlob,
                ext: extention,
                type: 'video'
            });
        } else {
            await inlayStorage.setItem(imgid, {
                name: img.name,
                data: videoBlob,
                ext: extention,
                type: 'video'
            });
        }

        return `${imgid}`
    }

    return null
}

export async function writeInlayImage(imgObj:HTMLImageElement, arg:{name?:string, ext?:string, id?:string} = {}) {

    let drawHeight = 0
    let drawWidth = 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    await new Promise((resolve) => {
        imgObj.onload = () => {
            drawHeight = imgObj.height
            drawWidth = imgObj.width

            //resize image to fit inlay, if total pixels exceed 1024*1024
            const maxPixels = 1024 * 1024
            const currentPixels = drawHeight * drawWidth

            if(currentPixels > maxPixels){
                const scaleFactor = Math.sqrt(maxPixels / currentPixels)
                drawWidth = Math.floor(drawWidth * scaleFactor)
                drawHeight = Math.floor(drawHeight * scaleFactor)
            }

            canvas.width = drawWidth
            canvas.height = drawHeight
            ctx.drawImage(imgObj, 0, 0, drawWidth, drawHeight)
            resolve(null)
        }
    })
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));


    const imgid = arg.id ?? v4()

    if (isNodeServer) {
        await saveToFileSystem(imgid, {
            name: arg.name ?? imgid,
            data: imageBlob,
            ext: 'png',
            height: drawHeight,
            width: drawWidth,
            type: 'image'
        });
    } else {
        await inlayStorage.setItem(imgid, {
            name: arg.name ?? imgid,
            data: imageBlob,
            ext: 'png',
            height: drawHeight,
            width: drawWidth,
            type: 'image'
        });
    }

    return `${imgid}`
}

function base64ToBlob(b64: string): Blob {
    const splitDataURI = b64.split(',');
    const byteString = atob(splitDataURI[1]);
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

function blobToBase64(blob: Blob): Promise<string> {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
    });
}

// Returns with base64 data URI
export async function getInlayAsset(id: string){
    let img: {
        name: string,
        data: string | Blob,
        ext: string
        height: number
        width: number
        type: 'image'|'video'|'audio'
    } = null;

    if (isNodeServer) {
        img = await loadFromFileSystem(id);
    } else {
        img = await inlayStorage.getItem(id);
    }

    if(img === null){
        return null
    }

    let data: string;
    if(img.data instanceof Blob){
        data = await blobToBase64(img.data)
    } else {
        data = img.data as string
    }

    return { ...img, data }
}

// Returns with Blob
export async function getInlayAssetBlob(id: string){
    let img: {
        name: string,
        data: string | Blob,
        ext: string
        height: number
        width: number
        type: 'image'|'video'|'audio'
    } = null;

    if (isNodeServer) {
        img = await loadFromFileSystem(id);
    } else {
        img = await inlayStorage.getItem(id);
    }

    if(img === null){
        return null
    }

    let data: Blob;
    if(typeof img.data === 'string'){
        // Migrate to Blob
        data = base64ToBlob(img.data)
        setInlayAsset(id, { ...img, data })
    } else {
        data = img.data
    }

    return { ...img, data }
}

export async function setInlayAsset(id: string, img:{
    name: string,
    data: string | Blob,
    ext: string,
    height: number,
    width: number,
    type: 'image'|'video'|'audio'
}){
    if (isNodeServer) {
        let blob: Blob;
        if (typeof img.data === 'string') {
            blob = base64ToBlob(img.data);
        } else {
            blob = img.data;
        }
        await saveToFileSystem(id, { ...img, data: blob });
    } else {
        await inlayStorage.setItem(id, img);
    }
}

export function supportsInlayImage(){
    const db = getDatabase()
    return getModelInfo(db.aiModel).flags.includes(LLMFlags.hasImageInput)
}

export async function reencodeImage(img:Uint8Array){
    if(checkImageType(img) === 'PNG'){
        return img
    }
    const canvas = document.createElement('canvas')
    const imgObj = new Image()
    imgObj.src = URL.createObjectURL(new Blob([img], {type: `image/png`}))
    await imgObj.decode()
    let drawHeight = imgObj.height
    let drawWidth = imgObj.width
    canvas.width = drawWidth
    canvas.height = drawHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgObj, 0, 0, drawWidth, drawHeight)
    const b64 = canvas.toDataURL('image/png').split(',')[1]
    const b = Buffer.from(b64, 'base64')
    return b
}

// 디버깅 및 관리용 함수들
export async function listAllInlays() {
    const keys = await getAllInlayKeys();
    console.log(`[Inlay] Total inlays: ${keys.length}`);
    console.log(`[Inlay] Storage: ${isNodeServer ? 'File System' : 'IndexedDB'}`);
    if (isNodeServer) {
        console.log(`[Inlay] Directory: ${INLAY_DIR}`);
    }
    return keys;
}

export async function migrateToFileSystem() {
    if (!isNodeServer) {
        console.error('[Inlay] Migration only available in Node.js environment');
        return;
    }

    console.log('[Inlay] Starting migration from IndexedDB to File System...');
    const keys = await inlayStorage.keys();
    let migrated = 0;

    for (const key of keys) {
        try {
            const item = await inlayStorage.getItem(key);
            if (item) {
                await saveToFileSystem(key, item);
                migrated++;
            }
        } catch (error) {
            console.error(`[Inlay] Failed to migrate ${key}:`, error);
        }
    }

    console.log(`[Inlay] Migration complete: ${migrated}/${keys.length} items migrated`);
}
