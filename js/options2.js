const { createApp } = Vue

const app = createApp({
    data() {
        return {
            proxyTreeList: [
                {
                    reqTableData: [
                        {
                            index: 0,
                            checked: true,
                            desc: '清北大学1',
                            req: 'Tom',
                        },
                        {
                            index: 1,
                            checked: false,
                            desc: '清北大学2',
                            req: 'Tom',
                        },
                        {
                            index: 2,
                            checked: false,
                            desc: '清北大学3',
                            req: 'Tom',
                        },
                        {
                            index: 3,
                            checked: false,
                            desc: '清北大学4',
                            req: 'Tom',
                        },
                    ],
                    resTableData: [
                        {
                            index: 0,
                            checked: true,
                            desc: '清北大学a',
                            res: 'Tom',
                        },
                        {
                            index: 1,
                            checked: false,
                            desc: '清北大学b',
                            res: 'Tom',
                        },
                        {
                            index: 2,
                            checked: false,
                            desc: '清北大学c',
                            res: 'Tom',
                        },
                        {
                            index: 3,
                            checked: false,
                            desc: '清北大学d',
                            res: 'Tom',
                        },
                    ],
                }
            ],
            activeProxytreeIndex: '',
            activeReqResTable: '',
            activeTableIndex: '',
            sliderDialogVisible: false,
            isAdd: false,
            rules: {
                reqRes: [
                    { required: true, message: '必填', trigger: 'blur' },
                ],
            },
            editForm: {
                desc: '',
                reqRes: '',
                checked: true,
            }
        }
    },
    mounted() {
        document.getElementById('jsonFile1').onchange = this.handleImport;
        if (this.proxyTreeList.length === 0) {
            document.getElementById('jsonFile2').addEventListener('change', this.handleImport);
        }
    },
    watch: {
        // 每当 question 改变时，这个函数就会执行
        proxyTreeList(newVal) {
            if (newVal.length === 0) {
                document.getElementById('jsonFile2').addEventListener('change', this.handleImport);
            } else {
                document.getElementById('jsonFile2')?.removeEventListener('change', this.handleImport);
            }
        }
    },
    methods: {
        // chrome://extensions/shortcuts 打开这个手动设个快捷键
        handleImport(evt) {
            let resultFile = evt.target.files[0];
            if (resultFile) {
                let reader = new FileReader();
                reader.readAsText(resultFile);
                reader.onload = e => {
                    try {
                        let data = JSON.parse(e.target.result)
                        this.proxyTreeList = data;
                        console.log(data)
                        // let data = JSON.parse(this.result);
                        // $scope.maps.length = 0;
                        // for (let i = 0, len = data.length; i < len; i++) {
                        //     $scope.maps.push(data[i]);
                        // }
                        // saveData();
                        // location.reload();
                    } catch (e) {
                        alert("导入失败，请检查文件格式是否正确");
                    }
                };
            }
        },
        saveAs(blob, filename) {
            let type = blob.type;
            let force_saveable_type = 'application/octet-stream';
            if (type && type != force_saveable_type) { // 强制下载，而非在浏览器中打开
                let slice = blob.slice || blob.webkitSlice;
                blob = slice.call(blob, 0, blob.size, force_saveable_type);
            }

            let url = URL.createObjectURL(blob);
            let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = url;
            save_link.download = filename;

            let event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
            URL.revokeObjectURL(url);
        },
        handleExport() {
            var URL = URL || webkitURL || window;
            var bb = new Blob([JSON.stringify([
                { a: 1 }
            ], null, ' '.repeat(4))], { type: 'text/json' });
            this.saveAs(bb, 'ReResSetting.json');
        },
        handleRowClick(proxyTreeIndex, reqResTable, rowData) {
            let targetTable = this.proxyTreeList[proxyTreeIndex][reqResTable];
            if (reqResTable === 'reqTableData') {
                let targetRow = targetTable[rowData.index];
                targetRow.checked = !targetRow.checked;
            } else {
                let targetRow = targetTable[rowData.index];
                if (!targetRow.checked) {
                    targetTable.filter((item, index) => index !== rowData.index).forEach(item => item.checked = false);
                }
                targetRow.checked = !targetRow.checked;
            }
        },
        tableRowClassName(proxyTreeIndex, reqResTable, { row, rowIndex }) {
            if (proxyTreeIndex === this.activeProxytreeIndex
                && reqResTable === this.activeReqResTable
                && rowIndex === this.activeTableIndex
            ) {
                return 'success-row';
            }
            return '';
        },
        handleEdit({ proxyTreeIndex, reqResTable, tableIndex, rowData }) {
            this.sliderDialogVisible = true;
            this.activeProxytreeIndex = proxyTreeIndex;
            this.activeReqResTable = reqResTable;
            this.activeTableIndex = tableIndex;
            let reqRes;
            let others1 = {};
            if (reqResTable === 'reqTableData') {
                reqRes = rowData.req;
                let { req, ...others2 } = rowData;
                others1 = others2;
            } else {
                reqRes = rowData.res;
                let { res, ...others2 } = rowData;
                others1 = others2;
            }

            this.editForm = others1;
            this.editForm.reqRes = reqRes;
        },
        handleMoveUp({ proxyTreeIndex, reqResTable, tableIndex }) {
            let targetTable = this.proxyTreeList[proxyTreeIndex][reqResTable];
            let { index: prevIndex, ...prevData } = targetTable[tableIndex - 1];
            let { index: curIndex, ...curData } = targetTable[tableIndex];
            targetTable[tableIndex - 1] = { ...curData, index: prevIndex };
            targetTable[tableIndex] = { ...prevData, index: curIndex };
        },
        handleMoveDown({ proxyTreeIndex, reqResTable, tableIndex }) {
            let targetTable = this.proxyTreeList[proxyTreeIndex][reqResTable];
            let { index: curIndex, ...curData } = targetTable[tableIndex];
            let { index: nextIndex, ...nextData } = targetTable[tableIndex + 1];
            targetTable[tableIndex] = { ...nextData, index: curIndex };
            targetTable[tableIndex + 1] = { ...curData, index: nextIndex };
        },
        handleDelete({ proxyTreeIndex, reqResTable, tableIndex }) {
            this.proxyTreeList[proxyTreeIndex][reqResTable].splice(tableIndex, 1);
        },
        handleAdd({ proxyTreeIndex, reqResTable, tableIndex }) {
            // this.proxyTreeList[proxyTreeIndex][reqResTable].splice(tableIndex, 1);
            this.sliderDialogVisible = true;
            this.isAdd = true;
            this.activeProxytreeIndex = proxyTreeIndex;
            this.activeReqResTable = reqResTable;
            this.activeTableIndex = tableIndex;
        },
        handleBeforeClose() {
            this.submitEditForm();
        },
        cancelForm() {
            this.activeProxytreeIndex = '';
            this.activeReqResTable = '';
            this.activeTableIndex = '';
            this.editForm = {
                desc: '',
                reqRes: '',
                checked: true,
            };
            this.sliderDialogVisible = false;
            this.isAdd = false;
        },
        async submitEditForm() {
            let result = await new Promise((resolve, reject) => {
                this.$refs.editFormRef[0].validate(valid => {
                    resolve(valid);
                });
            })

            if (!result) {
                return;
            }

            let newRowIndex = this.activeTableIndex + 1;
            if (this.activeReqResTable === 'reqTableData') {
                let { reqRes, ...others } = this.editForm;
                if (this.isAdd) {
                    this.proxyTreeList[this.activeProxytreeIndex][this.activeReqResTable].splice(newRowIndex, 0, {
                        index: newRowIndex,
                        req: reqRes,
                        ...others,
                    });
                } else {
                    this.proxyTreeList[this.activeProxytreeIndex][this.activeReqResTable][this.activeTableIndex] = {
                        req: reqRes,
                        ...others,
                    }
                }
            } else {
                let targetTable = this.proxyTreeList[this.activeProxytreeIndex][this.activeReqResTable];
                if (this.isAdd) {
                    if (this.editForm.checked) {
                        targetTable.forEach(item => item.checked = false);
                    }

                    let { reqRes, ...others } = this.editForm;

                    targetTable.splice(newRowIndex, 0, {
                        index: newRowIndex,
                        res: reqRes,
                        ...others,
                    });
                } else {
                    // radio按键互斥
                    let targetRow = targetTable[this.activeTableIndex];
                    if (!targetRow.checked && this.editForm.checked) {
                        targetTable.filter((item, index) => index !== this.activeTableIndex).forEach(item => item.checked = false);
                        targetRow.checked = true;
                    } else if (targetRow.checked && !this.editForm.checked) {
                        targetRow.checked = false;
                    }

                    let { reqRes, checked, ...others } = this.editForm;
                    this.proxyTreeList[this.activeProxytreeIndex][this.activeReqResTable][this.activeTableIndex] = {
                        checked: targetRow.checked,
                        res: reqRes,
                        ...others,
                    }
                }
            }

            this.cancelForm();
        },
    },
})

app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
