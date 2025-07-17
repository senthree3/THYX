document.addEventListener("DOMContentLoaded", function () {
    const hiddenInput = document.querySelector("#id_algorithm_params_json");
    if (!hiddenInput) return;

    // ✅ 初始化参数配置：合并 data-param-config（默认） 与 input.value（保存值）
    const defaultConfigs = JSON.parse(hiddenInput.getAttribute("data-param-config") || "{}");
    const savedConfigs = JSON.parse(hiddenInput.value || "{}");

    const paramConfigs = { ...defaultConfigs };
    for (const algo in savedConfigs) {
        if (!paramConfigs[algo]) continue;

        const savedParams = savedConfigs[algo];
        const defaultParams = paramConfigs[algo];

        const paramMap = Object.fromEntries(defaultParams.map(p => [p.key, p]));

        savedParams.forEach(saved => {
            if (paramMap[saved.key]) {
                paramMap[saved.key].value = saved.value;
            }
        });

        paramConfigs[algo] = Object.values(paramMap);
    }

    // ✅ 获取多选框渲染区域，用于插入参数容器
    const checkGroup = document.querySelector("#id_algorithm_choice");
    if (!checkGroup) return;

    const container = document.createElement("div");
    container.id = "dynamic-param-container";
    container.style.marginTop = "1.5em";
    checkGroup.parentNode.appendChild(container);

    function renderParams() {
        container.innerHTML = "";

        const checkboxes = document.querySelectorAll("input[name='algorithm_choice']:checked");
        const selected = Array.from(checkboxes).map(cb => cb.value);

        selected.forEach(algo => {
            const paramList = paramConfigs[algo] || [];
            if (!paramList.length) return;

            const section = document.createElement("div");
            section.style.borderTop = "1px solid #ccc";
            section.style.paddingTop = "1em";
            section.style.marginBottom = "1em";

            const labelEl = document.querySelector(`input[name="algorithm_choice"][value="${algo}"]`)?.closest("label");
            const labelText = labelEl ? labelEl.innerText.trim() : algo;

            const paramTitle = document.createElement("div");
            paramTitle.style.fontWeight = "bold";
            paramTitle.style.marginBottom = "0.5em";
            paramTitle.textContent = `${labelText}`;
            section.appendChild(paramTitle);

            const paramRow = document.createElement("div");
            paramRow.style.display = "flex";
            paramRow.style.flexWrap = "wrap";
            paramRow.style.gap = "10px";

            paramList.forEach(param => {
                const id = `${algo}__${param.key}`;

                const boxContainer = document.createElement("div");
                boxContainer.style.display = "flex";
                boxContainer.style.border = "1px solid #ddd";
                boxContainer.style.borderRadius = "4px";
                boxContainer.style.overflow = "hidden";
                boxContainer.style.minWidth = "230px";

                const labelContainer = document.createElement("div");
                labelContainer.style.padding = "8px 10px";
                labelContainer.style.backgroundColor = "#f5f7fa";
                labelContainer.style.borderRight = "1px solid #ddd";
                labelContainer.style.whiteSpace = "nowrap";
                labelContainer.style.display = "flex";
                labelContainer.style.alignItems = "center";
                // labelContainer.style.justifyContent = "flex-end";
                // labelContainer.style.width = "fit-content";
                labelContainer.style.width = "auto";
                labelContainer.style.minWidth = "auto";
                labelContainer.style.flexShrink = "0"; // 防止标签区域被压缩

                const label = document.createElement("label");
                label.setAttribute("for", id);
                label.textContent = param.name || param.key;
                // 覆盖默认CSS样式
                label.style.width = "auto";
                label.style.minWidth = "auto";
                label.style.margin = "0";
                label.style.padding = "0";
                labelContainer.appendChild(label);

                const inputContainer = document.createElement("div");
                inputContainer.style.padding = "8px 10px";
                inputContainer.style.flex = "1";
                inputContainer.style.display = "flex";
                inputContainer.style.alignItems = "center";

                let input;
                switch (param.class) {
                    case "BOOLEAN":
                        input = document.createElement("input");
                        input.type = "checkbox";
                        input.id = id;
                        input.checked = param.value === true || param.value === "true";  // ✅ 强化布尔判断
                        break;
                    case "INTEGER":
                    case "FLOAT":
                        input = document.createElement("input");
                        input.type = "number";
                        input.id = id;
                        input.value = param.value;
                        input.step = param.class === "FLOAT" ? "0.01" : "1";
                        input.min = param.min;
                        input.max = param.max;
                        input.style.width = "100%";
                        input.style.border = "none";
                        input.style.outline = "none";
                        break;
                    case "STRING":
                        input = document.createElement("input");
                        input.type = "text";
                        input.id = id;
                        input.value = param.value || "";
                        input.style.width = "100%";
                        input.style.border = "none";
                        input.style.outline = "none";
                        break;
                    default:
                        return;
                }

                inputContainer.appendChild(input);
                boxContainer.appendChild(labelContainer);
                boxContainer.appendChild(inputContainer);
                paramRow.appendChild(boxContainer);
            });

            section.appendChild(paramRow);
            container.appendChild(section);
        });

        const form = hiddenInput.closest("form");
        if (!form.dataset.boundSubmit) {
            form.dataset.boundSubmit = "true";
            form.addEventListener("submit", function () {
                const finalData = {};

                selected.forEach(algo => {
                    const paramList = paramConfigs[algo] || [];
                    finalData[algo] = [];

                    paramList.forEach(param => {
                        const id = `${algo}__${param.key}`;
                        const el = document.getElementById(id);
                        if (!el) return;

                        let value;
                        switch (param.class) {
                            case "BOOLEAN":
                                value = el.checked;
                                break;
                            case "INTEGER":
                                value = parseInt(el.value);
                                break;
                            case "FLOAT":
                                value = parseFloat(el.value);
                                break;
                            case "STRING":
                                value = el.value;
                                break;
                        }

                        finalData[algo].push({ ...param, value });
                    });
                });

                hiddenInput.value = JSON.stringify(finalData);
            });
        }
    }

    document.addEventListener("change", function (e) {
        if (e.target && e.target.name === "algorithm_choice") {
            renderParams();
        }
    });

    renderParams();
});
