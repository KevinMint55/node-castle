/**
 *
 * @author kevinmint 
 * @name Qiniu文件上传
 * 
 */

const Config = require('../../config.js');
const fs = require('fs');
const path = require('path');
const uuidv1 = require('uuid/v1');
const qiniu = require('qiniu');

function gUuid() {
    let uid = uuidv1();
    uid = uid.replace(/\-/g, '');
    return uid;
}

function upToLocal(files) {
    if (!files) return;
    const tmpdir = Config.assetsDir;
    let data = {};
    return new Promise((resolve) => {
        for (let key in files) {
            const file = files[key];
            const ext = file.name.split('.')[1];
            // const filename = `${Date.now()}${file.name}`;
            const filename = `${gUuid()}.${ext}`;
            const filePath = path.join(tmpdir, filename);
            const reader = fs.createReadStream(file.path);
            const writer = fs.createWriteStream(filePath);
            reader.pipe(writer).on('close', function () {
                data[key] = {
                    originalname: file.name,
                    filename,
                    filePath
                }
                if (Object.keys(files).length === Object.keys(data).length) {
                    resolve(data);
                }
            });
        }
    });
}

function removeImage(path) {
    fs.unlink(path, (err) => {
        if (err) {
            console.log('deleteError', err);
        }
    });
}

function upToQiniu(filePath, key) {
    var accessKey = Config.qiniu.accessKey;
    var secretKey = Config.qiniu.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var options = {
        scope: Config.qiniu.scope,
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);

    var config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2;
    // 是否使用https域名
    config.useHttpsDomain = true;
    // 上传是否使用cdn加速
    config.useCdnDomain = true;

    var localFile = filePath;
    var formUploader = new qiniu.form_up.FormUploader(config);
    var putExtra = new qiniu.form_up.PutExtra();
    // 文件上传
    return new Promise((resolve, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                // throw respErr;
                reject(respErr);
            }
            if (respInfo.statusCode == 200) {
                resolve(respBody);
            } else {
                // console.log(respInfo.statusCode);
                resolve(respBody);
            }
        });
    })
}

function getQiniuImageList(prefix) {
    var accessKey = Config.qiniu.accessKey;
    var secretKey = Config.qiniu.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    // config.useHttpsDomain = true;
    config.zone = qiniu.zone.Zone_z2;
    var bucketManager = new qiniu.rs.BucketManager(mac, config);
    var bucket = Config.qiniu.scope;
    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    var options = {
        // limit: 10,
        prefix,
    };
    return new Promise((resolve, reject) => {
        bucketManager.listPrefix(bucket, options, function (err, respBody, respInfo) {
            if (err) {
                reject(err);
            }
            if (respInfo.statusCode == 200) {
                //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
                //指定options里面的marker为这个值
                resolve(respBody);
            } else {
                resolve(respBody);
            }
        });
    })
}

function removeQiniuImageList(list) {
    var accessKey = Config.qiniu.accessKey;
    var secretKey = Config.qiniu.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var config = new qiniu.conf.Config();
    // config.useHttpsDomain = true;
    config.zone = qiniu.zone.Zone_z2;
    var bucketManager = new qiniu.rs.BucketManager(mac, config);
    var srcBucket = Config.qiniu.scope;
    var deleteOperations = list.map(item => {
        return qiniu.rs.deleteOp(srcBucket, item.key);
    });
    return new Promise((resolve, reject) => {
        bucketManager.batch(deleteOperations, function (err, respBody, respInfo) {
            if (err) {
                reject(err);
                //throw err;
            } else {
                // 200 is success, 298 is part success
                if (parseInt(respInfo.statusCode / 100) == 2) {
                    resolve(respBody);
                } else {
                    resolve(respBody);
                }
            }
        });
    })
}

module.exports = {
    upToLocal,
    removeImage,
    upToQiniu,
    getQiniuImageList,
    removeQiniuImageList,
}