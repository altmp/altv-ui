cmake_minimum_required (VERSION 3.21)

project(altv-ui LANGUAGES NONE)

file(GLOB_RECURSE ALTV_UI_SOURCES ${CMAKE_CURRENT_SOURCE_DIR}/src/*)

add_custom_command(
    COMMENT "Building ui..."
    BYPRODUCTS ${CMAKE_CURRENT_SOURCE_DIR}/node_modules
    OUTPUT ${CMAKE_CURRENT_SOURCE_DIR}/dist/index.html
    DEPENDS ${ALTV_UI_SOURCES}
    COMMAND npm i
    COMMAND npm run build
    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
)

add_custom_target(ALTV_UI
    DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/dist/index.html
)
