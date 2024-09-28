import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QTextEdit, QMenu
from PyQt6.QtGui import QAction
from PyQt6.QtCore import Qt  # Add this import

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Text Replacement App")
        self.setGeometry(100, 100, 400, 300)

        self.text_edit = QTextEdit(self)
        self.setCentralWidget(self.text_edit)
        
        self.text_edit.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)  # Updated this line
        self.text_edit.customContextMenuRequested.connect(self.show_context_menu)

    def show_context_menu(self, pos):
        context_menu = QMenu(self)
        prompt_action = QAction("sdkfsdf", self)
        prompt_action.triggered.connect(self.replace_text)
        context_menu.addAction(prompt_action)
        context_menu.exec(self.text_edit.mapToGlobal(pos))

    def replace_text(self):
        self.text_edit.setPlainText('hello')

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())