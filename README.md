<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RisuAI 티키타카 테마 커스터마이저</title>
    <style>
        /* Page styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        h1, h2 {
            color: #333;
        }
        
        .notice {
            background-color: #ffe8cc;
            border-left: 4px solid #ff9800;
            padding: 10px 15px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .color-picker-section {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .color-picker {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .color-input {
            width: 100px;
            height: 50px;
            border: none;
            cursor: pointer;
        }
        
        .color-label {
            margin-top: 8px;
            font-size: 14px;
            text-align: center;
        }
        
        .preview-section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
        }
        
        .code-section {
            margin-bottom: 30px;
        }
        
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .copy-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        
        .copy-button:hover {
            background-color: #45a049;
        }
        
        pre {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            font-family: monospace;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #666;
        }
        
        /* RisuAI Theme Preview Styles */
        #theme-preview {
            background-color: #bacee0;
            padding: 20px;
            border-radius: 8px;
            width: 100%;
            box-sizing: border-box;
        }
        
        /* Base theme styles (copied from user's CSS) */
        .risu-preview :root {
            --preview-bg: #bacee0;
            --char-box-bg: #ffffff;
            --char-box-sh: rgba(114, 137, 218, 0.3);
            --user-box-bg: #ffde00;
            --user-box-sh: rgba(114, 137, 218, 0.2);
            --button-color: #99aab5;
            --button-color-hv: #7289da;
            --button-color-on: #43b581;
            --button-send: #99aab5;
            --button-send-hv: #7289da;
            --border-radius: 15px;
            --profile-size: 60px;
            --profile-radius: 50px;
            --chat-width: 100%;
            --profile-margin: 5px;
            --profile-vertical-margin: 5px;
        }

        .risu-preview {
            background-color: var(--preview-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 0;
            border-radius: 8px;
            color: #333333;
            min-height: 300px;
        }

        .risu-preview .risu-chat > div > div {
            margin-left: auto;
            margin-right: auto;
            width: 95%;
            max-width: 800px;
            position: relative;
        }

        .risu-preview .message-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            position: relative;
            margin-bottom: 1rem;
        }

        .risu-preview .buttons-container {
            display: flex;
            margin-bottom: 5px;
            justify-content: flex-end;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .risu-preview .message-container:hover .buttons-container {
            opacity: 1;
        }

        .risu-preview .message-container:not(:hover) .buttons-container {
            transition-delay: 0.5s;
        }

        .risu-preview .character-image > div,
        .risu-preview .char-image > div,
        .risu-preview .user-image > div {
            background-position: center !important;
            background-size: cover !important;
            border-radius: var(--profile-radius);
            width: var(--profile-size) !important;
            height: var(--profile-size) !important;
            margin-top: var(--profile-vertical-margin);
            background-color: #888;
        }

        .risu-preview .char-box-wrapper,
        .risu-preview .user-box-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: flex-start;
        }

        .risu-preview .char-box-wrapper {
            justify-content: flex-start;
            flex-direction: row;
        }

        .risu-preview .user-box-wrapper {
            justify-content: flex-end;
            flex-direction: row;
        }

        .risu-preview .char-chat-box,
        .risu-preview .user-chat-box {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            max-width: calc(100% - var(--profile-size) - var(--profile-margin));
            margin-left: 50px;
        }

        .risu-preview .user-chat-box {
            align-items: flex-end;
            text-align: left;
            margin-right: 0px;
        }

        .risu-preview .char-chat-box {
            margin-left: var(--profile-margin);
        }

        .risu-preview .chat-box > span {
            max-width: 100%;
            width: fit-content;
            display: inline-block;
            border-radius: 15px;
            padding: 0.7rem 1rem;
            word-break: break-word;
            overflow-wrap: break-word;
            margin-bottom: 0.2rem;
        }

        .risu-preview .char-chat-box > span {
            background-color: var(--char-box-bg);
            box-shadow: var(--char-box-sh);
            margin-top: 10px;
            color: var(--text-color, #333333);
        }

        .risu-preview .user-chat-box > span {
            background-color: var(--user-box-bg);
            text-align: left;
            box-shadow: var(--user-box-sh);
            margin-top: 10px;
            color: var(--text-color, #333333);
        }

        .risu-preview .character-image, 
        .risu-preview .character-textbox {
            display: flex;
        }

        .risu-preview .character-image, 
        .risu-preview .character-textbox {
            display: inline-block;
            vertical-align: top;
        }

        .risu-preview .character-textbox {
            width: calc(100% - var(--profile-size) - var(--profile-margin));
            margin-left: var(--profile-margin);
        }

        @media (max-width: 600px) {
            .color-picker-section {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>RisuAI 티키타카 테마 커스터마이저</h1>
        
        <div class="notice">
            테스트를 많이 안 했어요. 버그가 있을 수 있어요.
        </div>
        
        <div class="color-picker-section">
            <div class="color-picker">
                <input type="color" id="background-color" value="#bacee0" class="color-input" title="채팅 배경 색">
                <label class="color-label">채팅 배경 색</label>
            </div>
            
            <div class="color-picker">
                <input type="color" id="char-bubble-color" value="#ffffff" class="color-input" title="캐릭터 말풍선 색">
                <label class="color-label">캐릭터 말풍선 색</label>
            </div>
            
            <div class="color-picker">
                <input type="color" id="user-bubble-color" value="#ffde00" class="color-input" title="유저 말풍선 색">
                <label class="color-label">유저 말풍선 색</label>
            </div>
        </div>
        
        <h2>미리보기</h2>
        <div class="preview-section">
            <div class="risu-preview" id="theme-preview">
                <div class="risu-chat">
                    <div>
                        <div>
                            <div class="message-container">
                                <div class="buttons-container">
                                    <!-- Placeholder for buttons -->
                                </div>
                            
                                <div class="char-box-wrapper">
                                    <div class="character-image char-image">
                                        <div style="background-color: #888;"></div>
                                    </div>
                            
                                    <div class="character-textbox">
                                        <div class="char-chat-box chat-box">
                                            <span>설정 - 소리 및 디스플레이 에서 테마를 `Custom HTML`로 바꾼 후, `채팅 HTML`에 커스텀HTML을 붙여넣기 하세요.<br></br>글씨 색깔은 `소리 및 디스플레이 - 텍스트 색상` 에서 지정할 수 있어요.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="message-container">
                                <div class="buttons-container">
                                    <!-- Placeholder for buttons -->
                                </div>
                            
                                <div class="user-box-wrapper">
                                    <div class="character-textbox">
                                        <div class="user-chat-box chat-box">
                                            <span>커스텀 CSS는 `소리 및 디스플레이 - 기타` 에서 스크롤 쭉 내리면 나오는 텍스트박스에 붙여넣으시면 돼요.</span>
                                        </div>
                                    </div>
                            
                                    <div class="character-image user-image">
                                        <div style="background-color: #888;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="code-section">
            <div class="code-header">
                <h2>커스텀 HTML</h2>
                <button id="copy-html" class="copy-button">HTML 복사</button>
            </div>
            <pre id="html-code">&lt;div class="message-container"&gt;
    &lt;!-- Independent buttons container --&gt;
    &lt;div class="buttons-container"&gt;
        &lt;risubuttons&gt;&lt;/risubuttons&gt;
    &lt;/div&gt;

    {{#if {{equal::{{role}}::char}} }}  &lt;!-- 캐릭터 메시지 --&gt;
    &lt;div class="char-box-wrapper"&gt;  &lt;!-- 캐릭터 메시지 래퍼 시작 --&gt;
        &lt;!-- Profile image (왼쪽) --&gt;
        &lt;div class="character-image char-image"&gt;
            &lt;risuicon&gt;
        &lt;/div&gt;

        &lt;!-- Text container --&gt;
        &lt;div class="character-textbox"&gt;
            &lt;div class="char-chat-box chat-box"&gt;
                &lt;risutextbox&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt; &lt;!-- 캐릭터 메시지 래퍼 끝 --&gt;
    {{/if}}

    {{#if {{not_equal::{{role}}::char}} }}  &lt;!-- 사용자 메시지 --&gt;
    &lt;div class="user-box-wrapper"&gt;  &lt;!-- 사용자 메시지 래퍼 시작 --&gt;
        &lt;!-- Text container (왼쪽) --&gt;
        &lt;div class="character-textbox"&gt;
            &lt;div class="user-chat-box chat-box"&gt;
                &lt;risutextbox&gt;
            &lt;/div&gt;
        &lt;/div&gt;

        &lt;!-- Profile image (오른쪽) --&gt;
        &lt;div class="character-image user-image"&gt;
            &lt;risuicon&gt;
        &lt;/div&gt;
    &lt;/div&gt; &lt;!-- 사용자 메시지 래퍼 끝 --&gt;
    {{/if}}
&lt;/div&gt;</pre>
        </div>
        
        <div class="code-section">
            <div class="code-header">
                <h2>CSS 코드</h2>
                <button id="copy-css" class="copy-button">CSS 복사</button>
            </div>
            <pre id="css-code">:root {
    --preview-bg: #bacee0; /* 채팅 배경 색 */
    --char-box-bg: #ffffff; /* 캐릭터 말풍선 색 */
    --char-box-sh: rgba(114, 137, 218, 0.3);
    --user-box-bg: #ffde00; /* 유저 말풍선 색 */
    --user-box-sh: rgba(114, 137, 218, 0.2);
    --button-color: #99aab5;
    --button-color-hv: #7289da;
    --button-color-on: #43b581;
    --button-send: #99aab5;
    --button-send-hv: #7289da;
    --border-radius: 15px;
    --profile-size: 60px; /* 프로필 사진 크기 */
    --profile-radius: 50px; /* 프로필 사진 둥글기 */
    --chat-width: 100%;
    --profile-margin: 5px;
    --profile-vertical-margin: 5px;
}

body {
    background-color: var(--preview-bg);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
}

.risu-chat > div > div {
    margin-left: auto;
    margin-right: auto;
    width: 90%;
    max-width: 500px;
    position: relative;
}

.message-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    margin-bottom: 0.5rem;
}

.buttons-container {
    display: flex;
    margin-bottom: 5px;
    justify-content: flex-end;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.message-container:hover .buttons-container {
    opacity: 1;
}

.message-container:not(:hover) .buttons-container {
    transition-delay: 0.5s;
}

.character-image > div,
.char-image > div,
.user-image > div {
    background-position: center !important;
    background-size: cover !important;
    border-radius: var(--profile-radius);
    width: var(--profile-size) !important;
    height: var(--profile-size) !important;
    margin-top: var(--profile-vertical-margin);
}

.char-box-wrapper,
.user-box-wrapper {
    position: relative;
    width: 100%;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: flex-start;
}

.char-box-wrapper {
    justify-content: flex-start;
    flex-direction: row;
}

.user-box-wrapper {
    justify-content: flex-end;
    flex-direction: row;
}

.char-chat-box,
.user-chat-box {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-width: calc(100% - var(--profile-size) - var(--profile-margin));
    margin-left: 50px;
}

.user-chat-box {
    align-items: flex-end;
    text-align: left;
    margin-right: 0px;
}

.char-chat-box {
    margin-left: var(--profile-margin);
}


.chat-box > span {
    max-width: 100%;
    width: fit-content;
    display: inline-block;
    border-radius: var(--border-radius);
    padding: 0.7rem 1rem;
    word-break: break-word;
    overflow-wrap: break-word;
    margin-bottom: 0.2rem;
}

.char-chat-box > span {
    background-color: var(--char-box-bg);
    box-shadow: var(--char-box-sh);
    margin-top: 10px;
    color: var(--text-color);
}

.user-chat-box > span {
    background-color: var(--user-box-bg);
    text-align: left;
    box-shadow: var(--user-box-sh);
    margin-top: 10px;
    color: var(--text-color);
}

#app > main .default-chat-screen > :first-child {
    width: 100%;
    max-width: 40rem;
    margin-left: auto;
    margin-right: auto;
}

@media (max-width: 600px) {
    .risu-chat > div > div {
        width: 95%;
    }

    .char-chat-box,
    .user-chat-box {
        width: calc(100% - var(--profile-size) - var(--profile-margin));
        max-width: calc(100% - var(--profile-size) - var(--profile-margin));
    }

    .chat-box > span {
        margin-bottom: 0;
    }

    .char-chat-box {
        margin-left: var(--profile-margin);
    }

    .user-chat-box {
        margin-right: var(--profile-margin);
    }
}

.prose-invert {
    --tw-prose-body: #000000;
}

.character-image, .character-textbox {
    display: flex;
}

.character-image, .character-textbox {
    display: inline-block;
    vertical-align: top;
}

.character-textbox {
    width: calc(100% - var(--profile-size) - var(--profile-margin));
    margin-left: var(--profile-margin);
}</pre>
        </div>
        
        <div class="footer">
            &copy; 2025 RisuAI 티키타카 테마 커스터마이저
        </div>
    </div>
    
    <script>
        // Color picker functionality
        const backgroundColorPicker = document.getElementById('background-color');
        const charBubbleColorPicker = document.getElementById('char-bubble-color');
        const userBubbleColorPicker = document.getElementById('user-bubble-color');
        const themePreview = document.getElementById('theme-preview');
        const cssCode = document.getElementById('css-code');
        
        // Function to update preview and CSS code
        function updateColors() {
            // Update preview
            themePreview.style.backgroundColor = backgroundColorPicker.value;
            
            // Update chat bubbles in preview
            const charBubbles = document.querySelectorAll('.risu-preview .char-chat-box > span');
            charBubbles.forEach(bubble => {
                bubble.style.backgroundColor = charBubbleColorPicker.value;
            });
            
            const userBubbles = document.querySelectorAll('.risu-preview .user-chat-box > span');
            userBubbles.forEach(bubble => {
                bubble.style.backgroundColor = userBubbleColorPicker.value;
            });
            
            // Update CSS code
            let updatedCss = cssCode.textContent;
            updatedCss = updatedCss.replace(/--preview-bg: #[0-9a-fA-F]{6};/, `--preview-bg: ${backgroundColorPicker.value};`);
            updatedCss = updatedCss.replace(/--char-box-bg: #[0-9a-fA-F]{6};/, `--char-box-bg: ${charBubbleColorPicker.value};`);
            updatedCss = updatedCss.replace(/--user-box-bg: #[0-9a-fA-F]{6};/, `--user-box-bg: ${userBubbleColorPicker.value};`);
            
            cssCode.textContent = updatedCss;
        }
        
        // Add event listeners to color pickers
        backgroundColorPicker.addEventListener('input', updateColors);
        charBubbleColorPicker.addEventListener('input', updateColors);
        userBubbleColorPicker.addEventListener('input', updateColors);
        
        // Copy buttons functionality
        document.getElementById('copy-html').addEventListener('click', function() {
            const htmlCode = document.getElementById('html-code').textContent;
            copyToClipboard(htmlCode, '커스텀 HTML이 클립보드에 복사되었습니다!');
        });
        
        document.getElementById('copy-css').addEventListener('click', function() {
            const cssCode = document.getElementById('css-code').textContent;
            copyToClipboard(cssCode, 'CSS가 클립보드에 복사되었습니다!');
        });
        
        function copyToClipboard(text, successMessage) {
            navigator.clipboard.writeText(text).then(function() {
                alert(successMessage);
            }, function(err) {
                alert('복사 중 오류가 발생했습니다: ' + err);
            });
        }
        
        // Initialize colors
        updateColors();
    </script>
</body>
</html>
