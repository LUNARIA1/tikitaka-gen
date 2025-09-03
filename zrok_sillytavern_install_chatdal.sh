talktalklike9@instance-20250903-110106:~$ curl -sL https://raw.githubusercontent.com/LUNARIA1/tikitaka-gen/main/zrok_sillytavern_install_chatdal.sh | bash
bash: line 2: $'\r': command not found
============================================================
SillyTavern 및 zrok 자동 설치를 시작합니다.
이 작업은 몇 분 정도 소요될 수 있습니다. 잠시만 기다려주세요.
============================================================
bash: line 8: $'\r': command not found
[1/6] 시스템을 업데이트하고 필수 패키지를 설치합니다...
E: Invalid operation update
E: Command line option '
   ' [from -y
   ] is not understood in combination with the other options.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
E: Unable to locate package npm
bash: line 14: $'\r': command not found
[2/6] SillyTavern (staging 브랜치)를 다운로드합니다...
bash: line 17: cd: $'~\r': No such file or directory
bash: line 18: git: command not found
bash: line 19: cd: $'SillyTavern\r': No such file or directory
bash: line 20: git: command not found
SillyTavern 다운로드 완료.
bash: line 22: $'\r': command not found
[3/6] SillyTavern에 필요한 파일들을 설치합니다. (npm install)
bash: line 25: npm: command not found
bash: line 26: $'\r': command not found
[4/6] zrok 터널링 프로그램을 설치합니다...
--2025-09-03 11:07:23--  https://github.com/openziti/zrok/releases/download/v0.4.23/zrok_0.4.23_linux_amd64.tar.gz%0D
Resolving github.com (github.com)... 140.82.112.3
Connecting to github.com (github.com)|140.82.112.3|:443... connected.
HTTP request sent, awaiting response... 404 Not Found
2025-09-03 11:07:23 ERROR 404: Not Found.

tar: zrok_0.4.23_linux_amd64.tar.gz\r: Cannot open: No such file or directory
tar: Error is not recoverable: exiting now
rm: cannot remove 'zrok_0.4.23_linux_amd64.tar.gz'$'\r': No such file or directory
bash: line 32: $'\r': command not found
': not a valid identifierK_TOKEN
bash: line 35: ./zrok: No such file or directory
zrok 설정이 완료되었습니다.
bash: line 37: $'\r': command not found
[5/6] SillyTavern과 zrok을 백그라운드에서 실행합니다...
bash: line 42: $'\r': command not found
bash: line 45: $'\r': command not found
zrok이 외부 접속 주소를 생성 중입니다. (약 15초 소요)
sleep: invalid time interval ‘15\r’
Try 'sleep --help' for more information.
bash: line 49: $'\r': command not found
[6/6] 모든 설정이 완료되었습니다!
bash: line 52: ./zrok: No such file or directory
bash: line 52: ./zrok: No such file or directory
bash: line 53: $'\r': command not found
bash: line 57: $'\r': command not found
bash: line 58: $'\r': command not found
============================================================
🎉 설치가 완료되었습니다! 🎉
아래 주소를 복사하여 스마트폰이나 다른 컴퓨터에서 접속하세요:
No screen session found.
============================================================