:: 1. Limpieza granular de declaraciones en librerías for /r libs %i in (\*.d.ts) do @del /f /q "%i"

:: 2. Limpieza granular de mapas de fuente en librerías for /r libs %i in (\*.map) do @del /f /q
"%i"

:: 3. Limpieza de rastro de caché de construcción en librerías for /r libs %i in (\*.tsbuildinfo) do
@del /f /q "%i"
