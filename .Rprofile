if (interactive()) {
  .escape_html <- function() {
    ctx <- rstudioapi::getSourceEditorContext()
    stopifnot(length(ctx$selection) == 1)
    text <- ctx$selection[[1]]$text
    text <- js4shiny:::escape_html_example(text)
    clipr::write_clip(text)
    rstudioapi::insertText(
      location = ctx$selection[[1]]$range,
      text = text,
      id = ctx$id
    )
    invisible(text)
  }

  .style_project <- function() {
    styler:::style_dir(
      filetype = c("r", "rmd", "Rprofile"),
      transformers = grkstyle::grk_style_transformer()
    )
  }
}

source(file.path(Sys.getenv("HOME"), ".Rprofile"))
