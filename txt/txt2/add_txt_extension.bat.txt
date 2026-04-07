@echo off
for %%f in (*) do (
    if /I not "%%~xf"==".txt" (
        ren "%%f" "%%f.txt"
    )
)
echo Done! .txt added to all files.
pause