var lineBase = 21;
var sourceFileName = "ConsoleApplication18.cpp";

var exemplo =
    {
        "name": "MyStart",
        "call": "NULL",
        "lines0": "//line1\n",
        "args": [
            { "type": "Target*", "name": "pTarget" }
        ]
        ,
        "calls":
        [
            {
                "name": "Connect",
                "call": "\"server\"",
                "lines0": "//line1\n",
                "lines1": "//line3\n",
                "captures":
                [
                    { "type": "const char*", "name": "user" },
                    { "type": "const char*", "name": "password" },
                    { "type": "const char*", "name": "key" }
                ],
                "args": [
                    { "type": "Connection*", "name": "pConnection" }
                ]
            },
            {
                "name": "Login",
                "call": "user, password",
                "captures": [
                    { "type": "const char*", "name": "key" }
                ],
                "args": [
                    { "type": "Token*", "name": "pToken" }
                ]
            },
            {
                "name": "Read",
                "call": "key",
                "captures": [],
                "args": [
                    { "type": "Value*", "name": "pValue" }
                ]
            }
        ]
    };



function GenerateLines(lineNumber: number, lines: string) {
    var s = "";
    //s += "\n";
    var ar = lines.split('\n');
    for (var i = 0; i < ar.length; i++) {
        var tline = ar[i].trim();
        //if (tline != "")
        //{
        s += "#line " + lineBase + lineNumber + " " + sourceFileName + "\n";
        //}
        s += Ident(2) + ar[i].trim();
        s += '\n';
        lineNumber++;
    }

    return s;
}

function GenerateTargetTypeVar(target: any) {
    var s = "";
    s += "void (*onResult)(Result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += target.args[i].type;
    }
    s += ", void*)";

    return s;
}


function GenerateTargetErrorCall(target: any) {
    var s = "";

    s += "onResult(result";
    for (var i = 0; i < target.args.length; i++) {
        s += ", ";
        s += "NULL";//target[i].type;
    }
    s += ", data);//target error call\n";
    return s;
}

function SameSizeOf(sInput: string) {
    var s = "";
    for (var i = 0; i < sInput.length; i++) {
        s += " ";
    }
    return s;
}

function Ident(n: number) {
    var s = "";
    for (var i = 0; i < n; i++) {
        s += "    ";
    }
    return s;
}
function GenerateArguments(spaces: string, items: Array<any>) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].type + " " + items[i].name;
        if (i < items.length - 1) {
            s += ",\n" + spaces;
        }
    }
    return s;
}

function GenerateCaptureNames(items: Array<any>) {
    var s = "";
    for (var i = 0; i < items.length; i++) {
        s += items[i].name;
        if (i < items.length - 1) {
            s += ", ";
        }
    }
    return s;
}
function GenerateCapture(identation: number, info: any, source: any) {
    var name0 = info.name;
    var captures = info.captures;
    var name = name0 + "_Capture";
    var ErrorType = "Result";

    var s = "";

    //declara struct
    s += "struct " + name + "\n";
    s += "{\n";
    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 1) + captures[i].type + " " + captures[i].name + ";\n";
    }

    s += Ident(identation + 1) + GenerateTargetTypeVar(source) + ";\n";
    s += Ident(identation + 1) + "void* data;\n";


    s += "};\n";

    var spaces = SameSizeOf(ErrorType + " " + name + "_Init(");

    //implementa init
    s += "\n";
    var captureStr = GenerateArguments(spaces, captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += ErrorType + " " + name + "_Init(" + name + "** pp,\n" + spaces + captureStr + GenerateTargetTypeVar(source) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(identation + 1) + "Result result;\n";
    s += Ident(identation + 1) + "struct " + name + "*p = " + "(struct " + name + "*)" + "malloc(sizeof(" + "struct " + name + "));\n"
    s += Ident(identation + 1) + "result = p ? RESULT_OK : RESULT_OUTOFMEM;\n";
    s += Ident(identation + 1) + "if (result == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";
    //implementa copias do init
    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 2) + "p->" + captures[i].name + " = _strdup(" + captures[i].name + ");\n";

    }
    s += Ident(identation + 2) + "p->onResult = onResult;\n";
    s += Ident(identation + 2) + "p->data = data;\n";
    s += Ident(identation + 2) + "*pp = p;\n";
    s += Ident(identation + 1) + "}\n";

    s += Ident(identation + 1) + "return result;\n";
    s += "}\n";

    ////////


    //implementa destroy
    s += "\n";
    s += "void" + " " + name + "_Destroy(" + name + "* p)\n";
    s += "{\n";

    for (var i = 0; i < captures.length; i++) {
        s += Ident(identation + 1) + "free((void*)p->" + captures[i].name + ");\n";
    }
    s += "}\n\n";


    return s;
};

function GenerateCaptureLocal(name0: string, captures: Array<any>, source: any) {
    var name = name0 + "_Capture";

    var ErrorType = "Result";

    var s = "";

    for (var i = 0; i < captures.length; i++) {
        s += Ident(1) + captures[i].type + " " + captures[i].name + " = ((struct " + name + "*) _data)->" + captures[i].name + ";\n";
    }

    s += Ident(1) + GenerateTargetTypeVar(source) + " = ((struct " + name + "*) _data)->" + "onResult" + ";\n";
    s += Ident(1) + "void* data" + " = ((struct " + name + "*) _data)->" + "data" + ";\n";

    return s;
}
function GenerateLambdaCall(identation: number, info: any) {

    var s = "";
    var name0 = info.name;
    var name = name0 + "_Lambda";

    var ErrorType = "Result";
    var ErrorVar = "result";
    s += "\n";


    s += GenerateLines(info.currentLine0, info.lines0);

    s += Ident(identation + 1) + "struct " + name0 + "_Capture* " + "_cap" + ";\n";
    var capStr = GenerateCaptureNames(info.captures);
    if (capStr != "") {
        capStr += ", ";
    }

    s += Ident(identation + 1) + ErrorVar + " = " + name0 + "_Capture_Init(&_cap, " + capStr + "onResult, data);\n";
    s += Ident(identation + 1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(identation + 1) + "{\n";

    var callargs = ""
    if (info.call != "") {
        callargs = info.call + ", ";
    }
    s += Ident(identation + 2) + name0 + "( " + callargs + name + ", " + "_cap" + ");\n";

    s += GenerateLines(info.currentLine0, info.lines1);

    s += Ident(identation + 1) + "}\n";
    return s;
}

function GenerateLambda(index: number, infos, source: any) {
    var info = infos[index];

    var name0 = info.name;
    var name = name0 + "_Lambda";
    var ErrorType = "Result";
    var ErrorVar = "result";

    var spaces = SameSizeOf("static void " + name + "(");
    var s = "";
    var funcargs = GenerateArguments(spaces, info.args);
    if (funcargs != "") {
        funcargs += ", ";
    }
    s += "static void " + name + "(" + ErrorType + " " + ErrorVar + ", " + funcargs + "void* _data)\n";
    s += "{\n";

    s += Ident(1) + "//capture vars\n";
    s += GenerateCaptureLocal(name0, info.captures, source);
    s += "\n";
    s += "\n";
    s += Ident(1) + "if (" + ErrorVar + " == RESULT_OK)\n";
    s += Ident(1) + "{\n";
    if (index < infos.length - 1) {
        s += Ident(2) + "//continuation\n";
        s += GenerateLambdaCall(1, infos[index + 1]);
    }
    else {
        //s += GenerateLines(info.lines0);
        s += source.beforeReturn;
        s += "\n";
        s += Ident(2) + "//succeded!!\n";
        var targetResultsStr = source.call;
        if (targetResultsStr != "") {
            targetResultsStr += ", ";
        }

        s += Ident(2) + "onResult(result, " + targetResultsStr + "data); //target\n";
    }

    s += Ident(1) + "}\n";
    s += "\n";
    s += Ident(1) + "if (" + ErrorVar + " != RESULT_OK)\n";
    s += Ident(1) + "{\n";
    s += Ident(2) + GenerateTargetErrorCall(source);
    s += Ident(1) + "}\n";


    s += "\n";
    s += Ident(1) + name0 + "_Capture_Destroy((struct " + name0 + "_Capture*)" + "_data);\n";
    s += "}\n\n";

    return s;
}

function Generate(source: any, textIn: string) {
    var strResult = "";

    var s = "";
    for (var i = (source.calls.length - 1); i >= 0; i--) {
        s += GenerateCapture(0, source.calls[i], source);
        s += GenerateLambda(i, source.calls, source);
    }

    s += "\n\n\n";

    var spaces = SameSizeOf("Result " + source.name + "(");
    var captureStr = GenerateArguments(spaces, source.calls[0].captures);
    if (captureStr != "") {
        captureStr += ",\n" + spaces;
    }
    s += "Result " + source.name + "(" + captureStr + GenerateTargetTypeVar(source) + ",\n" + spaces + "void* data" + ")\n";
    s += "{\n";
    s += Ident(1) + "Result result;\n";
    s += GenerateLambdaCall(0, source.calls[0]);
    //s += "\n";
    s += Ident(1) + "else\n";
    s += Ident(1) + "{\n";
    s += Ident(2) + GenerateTargetErrorCall(source);
    s += Ident(1) + "}\n\n";
    s += Ident(1) + "return result;\n";
    s += "}\n";

    strResult = s;

    return strResult;
}

function ParseFunctionResult(scanner: Scanner) {
    var typesAndNames: any = [];
    scanner.SkipBlanks();
    scanner.MatchToken("-");
    scanner.MatchToken(">");
    scanner.SkipBlanks();
    if (scanner.lexeme == "void") {
        //pode ser sem retorno
        scanner.MatchLexeme("void");
        scanner.SkipBlanks();
        if (scanner.token != '{') {
            var typename = "void";
            var modifier = "";
            var pointer = "";
            scanner.SkipBlanks();
            if (scanner.token == "*") {
                pointer = scanner.MatchToken("*");
                scanner.SkipBlanks();
            }

            var name = scanner.MatchToken("identifier");
            scanner.SkipBlanks();
            typesAndNames.push({ "type": modifier + typename + pointer, "name": name });
        }
    }
    else {
        //normal
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
    }
    while (scanner.token != "{") {
        typesAndNames.push(ParseTypeAndName(scanner));
        if (scanner.token == "{") {
            break;
        }
        else if (scanner.token == ",") {
            scanner.MatchToken(",");
        }
        else {
            throw "expected , or }";
        }
    }
    scanner.MatchToken("{");
    scanner.SkipBlanks();
    return typesAndNames;
}

function ParseTypeAndName(scanner: Scanner) {
    scanner.SkipBlanks();
    var modifier = "";
    var pointer = "";

    if (scanner.lexeme == "const" ||
        scanner.lexeme == "unsigned") {
        var modifier = scanner.MatchToken("identifier");
        modifier += " ";
        scanner.SkipBlanks();
    }

    var typename = scanner.MatchToken("identifier");
    scanner.SkipBlanks();

    if (scanner.token == "*") {
        pointer = scanner.MatchToken("*");
        scanner.SkipBlanks();
    }

    var name = scanner.MatchToken("identifier");
    scanner.SkipBlanks();
    return { "type": modifier + typename + pointer, "name": name };
}

function Parse(inputSource: string) {
    var sourceOut: any = {};
    sourceOut.name = "noname";
    sourceOut.call = "";
    sourceOut.args0 = [];
    sourceOut.args = [];
    sourceOut.calls = [];
    sourceOut.beforeReturn = "";

    try {
        var scanner = new Scanner(inputSource);
        scanner.SkipBlanks();
        scanner.MatchLexeme("void");
        scanner.SkipBlanks();
        sourceOut.name = scanner.MatchToken("identifier");
        scanner.SkipBlanks();
        scanner.MatchToken("(");
        scanner.SkipBlanks();

        while (scanner.token != ")") {
            sourceOut.args0.push(ParseTypeAndName(scanner));

            if (scanner.token == ")") {
            }
            else if (scanner.token == ",") {
                scanner.MatchToken(",");
                scanner.SkipBlanks();
            }
            else {
                throw "expected , or )";
            }
        }//parametros
        scanner.MatchToken(")");
        sourceOut.args = ParseFunctionResult(scanner);
        var lines = "";
        for (; ;) {
            if (scanner.lexeme == "return") {
                sourceOut.beforeReturn = lines;
                lines = "";

                scanner.MatchLexeme("return");
                scanner.SkipBlanks();
                sourceOut.call = "";
                for (; ;) {
                    if (scanner.token != ';') {
                        sourceOut.call += scanner.lexeme;
                    }
                    else {
                        break;
                    }
                    scanner.Next();
                }
                scanner.MatchToken(';');
                scanner.SkipBlanks();
            }
            else if (scanner.lexeme == "async") {
                var call: any = {};
                call.captures = [];

                scanner.MatchLexeme("async");
                scanner.SkipBlanks();

                call.currentLine0 = scanner.currentLine;
                call.lines0 = lines;
                call.lines1 = "";
                lines = "";

                scanner.MatchLexeme("[");
                while (scanner.token != "]") {
                    call.captures.push(ParseTypeAndName(scanner));

                    if (scanner.token == "]") {
                    }
                    else if (scanner.token == ",") {
                        scanner.MatchToken(",");
                        scanner.SkipBlanks();
                    }
                    else {
                        throw "expected , or )";
                    }
                }//captures
                scanner.MatchToken("]");
                scanner.SkipBlanks();

                call.name = scanner.MatchToken("identifier");


                scanner.SkipBlanks();
                scanner.MatchToken("(");
                scanner.SkipBlanks();
                var callStr = "";
                for (; ;) {
                    if (scanner.token == ")") {
                        scanner.MatchToken(")");
                        break;
                    }
                    callStr += scanner.lexeme;
                    scanner.Next();
                }
                call.call = callStr;
                call.args = ParseFunctionResult(scanner);
                sourceOut.calls.push(call);
            }
            else {
                lines += scanner.lexeme;
                scanner.Next();
            }

            if (scanner.token == "eof") {
                break;
            }
        }

    }
    catch (er) {
    }

    return sourceOut;
}

class Scanner {
    stringSource: string;
    current: number;

    lexeme: string;
    token: string;
    ignoreWhitespaces: boolean;
    currentLine: number;

    constructor(src: string) {
        this.currentLine = 0;
        this.ignoreWhitespaces = false;
        this.current = 0;
        this.stringSource = src;
        this.Next();
    }

    public MatchLexeme(tk: string) {
        if (this.lexeme != tk) {
            throw "Invalid token" + tk;
        }
        this.Next();
    }

    public MatchToken(tk: string) {
        var lexeme = this.lexeme;
        if (this.token != tk) {
            throw "Invalid token" + tk;
        }
        this.Next();
        return lexeme;
    }

    public SkipBlanks() {
        while (this.token != "eof" &&
            (this.token == "whitespace" || this.token == "linebreak")) {
            this.Next();
        }
    }

    public Next() {
        if (this.current == this.stringSource.length) {
            this.lexeme = "";
            this.token = "eof";
            return false;
        }

        var ch = this.stringSource[this.current];

        if (ch == '\n') {
            //incrementa a linha
            this.currentLine++;

            this.current++;
            this.lexeme = '\n';
            this.token = "linebreak";
            return true;
        }

        var whitespace = "";
        while (ch == ' ' || ch == '\n' || ch == '\r' || ch == '\t') {
            whitespace += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (whitespace != "") {
            this.lexeme = whitespace;
            this.token = "whitespace";
            return true;
        }

        var identifier = "";
        while ((ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch == '_')) {
            identifier += ch;
            this.current++;
            ch = this.stringSource[this.current];
        }
        if (identifier != "") {
            this.lexeme = identifier;
            this.token = "identifier";
            return true;
        }

        this.current++;
        this.lexeme = ch;
        this.token = ch;//"punctuator";
        return true;
    }

}

function ButtonClick() {
    var textIn = <HTMLTextAreaElement>document.getElementById("InputText");
    var textOut = <HTMLTextAreaElement>document.getElementById("OuputText");

    var r = "";
    //tem que gerar este source
    try {
        //var source = JSON.parse(textIn.value);
        var source = Parse(textIn.value);
        var r = Generate(source, textIn.value);
    }
    catch (e) {
        r = e;
    }
    textOut.value = r;

}

window.onload = () => {
    var textIn = <HTMLTextAreaElement>document.getElementById("InputText");
    var s = "";
    s += "void Read(const char * user,\n";
    s += "          const char * password) ->Value * pValue\n";
    s += "{\n";
    s += "    async [const char* user, const char* passoword] Connect(server)->Connection * pConnection\n";
    s += "    {\n";
    s += "        async [] Login(pConnection, user, password) ->Token * pToken\n";
    s += "        {\n";
    s += "            pConnection ->SetToken(pToken);\n";
    s += "            async [] Read(server) ->Value * pValue\n";
    s += "            {\n";
    s += "                return (pValue);\n";
    s += "            }\n";
    s += "        }\n";
    s += "     }\n";
    s += "}\n";
    //JSON.stringify(exemplo);
    textIn.value = s;
};
