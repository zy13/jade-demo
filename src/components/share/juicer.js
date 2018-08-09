/**
 * @Author: Jet.Chan
 * @Date:   2017-01-10T17:42:29+08:00
 * @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-01-10T17:50:06+08:00
 */



import juicer from 'juicer';

juicer.register('jsonStringify', (data) => {
    return JSON.stringify(data)
})

juicer.register('jsonStringify_dic', (select, keyName, vName) => {
    let op = [];
    if (select) {
        select.map((i, k) => {
            op.push({
                value: vName ? i[vName] : k,
                text: keyName ? i[keyName] : i.name
            });
        });
    }
    return JSON.stringify(op)
})

export default juicer;
